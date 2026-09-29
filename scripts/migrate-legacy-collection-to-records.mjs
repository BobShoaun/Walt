import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import { loadEnv } from "vite";

const confirmationFlag = "--confirm-migrate-records";
if (!process.argv.includes(confirmationFlag)) {
  throw new Error(
    `This copies documents from the legacy collection "expenses" to "records" and then deletes the old documents. Re-run with ${confirmationFlag} to confirm.`,
  );
}

const env = loadEnv("development", process.cwd(), "VITE_");
const requiredEnv = (key) => {
  const value = env[key];
  if (!value) throw new Error(`Missing ${key} in .env.local`);
  return value;
};

const app = initializeApp({
  apiKey: requiredEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requiredEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("VITE_FIREBASE_APP_ID"),
});
const db = getFirestore(app);

const [legacySnapshot, recordsSnapshot] = await Promise.all([
  getDocs(collection(db, "expenses")),
  getDocs(collection(db, "records")),
]);

const existingRecordIds = new Set(recordsSnapshot.docs.map(({ id }) => id));
const conflicts = legacySnapshot.docs
  .filter(({ id }) => existingRecordIds.has(id))
  .map(({ id }) => id);

if (conflicts.length > 0) {
  throw new Error(
    `Migration aborted before writing: record IDs already exist (${conflicts.slice(0, 5).join(", ")}).`,
  );
}

for (let offset = 0; offset < legacySnapshot.docs.length; offset += 450) {
  const batch = writeBatch(db);
  for (const legacyDoc of legacySnapshot.docs.slice(offset, offset + 450)) {
    batch.set(doc(db, "records", legacyDoc.id), legacyDoc.data());
  }
  await batch.commit();
}

for (let offset = 0; offset < legacySnapshot.docs.length; offset += 450) {
  const batch = writeBatch(db);
  for (const legacyDoc of legacySnapshot.docs.slice(offset, offset + 450)) {
    batch.delete(legacyDoc.ref);
  }
  await batch.commit();
}

console.log(
  `Moved ${legacySnapshot.size} document(s) from "expenses" to "records". Other collections were not modified.`,
);