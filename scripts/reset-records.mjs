import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import { loadEnv } from "vite";

const confirmationFlag = "--confirm-wipe-records";
if (!process.argv.includes(confirmationFlag)) {
  throw new Error(
    `This deletes every document in "records". Re-run with ${confirmationFlag} to confirm.`,
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

const [categorySnapshot, paymentMethodSnapshot, recordSnapshot] =
  await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "payment methods")),
    getDocs(collection(db, "records")),
  ]);

if (categorySnapshot.empty || paymentMethodSnapshot.empty) {
  throw new Error(
    'No records were changed: "categories" and "payment methods" must both contain documents.',
  );
}

const categoryIds = new Set(categorySnapshot.docs.map(({ id }) => id));
const paymentMethodIds = new Set(paymentMethodSnapshot.docs.map(({ id }) => id));
const sampleRecords = [
  {
    title: "Weekly groceries",
    description: "Produce, pantry staples, and coffee",
    amount: 86.43,
    categoryId: "groceries",
    paymentMethodId: "credit-card",
    daysAgo: 1,
  },
  {
    title: "Coffee and pastry",
    description: "Coffee and a croissant before work",
    amount: 8.75,
    categoryId: "food-and-drinks",
    paymentMethodId: "debit-card",
    daysAgo: 1,
  },
  {
    title: "Monthly transit pass",
    description: "Local public transit",
    amount: 112.00,
    categoryId: "transportation",
    paymentMethodId: "credit-card",
    daysAgo: 2,
  },
  {
    title: "Pharmacy essentials",
    description: "Toiletries and cold medicine",
    amount: 24.68,
    categoryId: "health-and-fitness",
    paymentMethodId: "debit-card",
    daysAgo: 3,
  },
  {
    title: "Lunch with coworkers",
    description: "Sandwich and soup",
    amount: 19.20,
    categoryId: "food-and-drinks",
    paymentMethodId: "credit-card",
    daysAgo: 4,
  },
  {
    title: "Streaming subscription",
    description: "Monthly video subscription",
    amount: 16.99,
    categoryId: "entertainment",
    paymentMethodId: "credit-card",
    daysAgo: 5,
  },
  {
    title: "Hydro bill",
    description: "Monthly electricity bill",
    amount: 94.32,
    categoryId: "utilities",
    paymentMethodId: "bank-transfer",
    daysAgo: 6,
  },
  {
    title: "Dinner with friends",
    description: "Shared plates and tip",
    amount: 68.40,
    categoryId: "food-and-drinks",
    paymentMethodId: "credit-card",
    daysAgo: 7,
  },
  {
    title: "Household supplies",
    description: "Laundry detergent and light bulbs",
    amount: 31.57,
    categoryId: "others",
    paymentMethodId: "debit-card",
    daysAgo: 8,
  },
  {
    title: "Weekend market",
    description: "Fresh fruit and flowers",
    amount: 27.85,
    categoryId: "groceries",
    paymentMethodId: "cash",
    daysAgo: 9,
  },
  {
    title: "Movie tickets",
    description: "Two evening tickets",
    amount: 32.00,
    categoryId: "entertainment",
    paymentMethodId: "credit-card",
    daysAgo: 10,
  },
  {
    title: "Ride home",
    description: "Late ride after dinner",
    amount: 22.16,
    categoryId: "transportation",
    paymentMethodId: "credit-card",
    daysAgo: 11,
  },
];

for (const record of sampleRecords) {
  if (!categoryIds.has(record.categoryId)) {
    throw new Error(
      `No records were changed: missing category "${record.categoryId}".`,
    );
  }
  if (!paymentMethodIds.has(record.paymentMethodId)) {
    throw new Error(
      `No records were changed: missing payment method "${record.paymentMethodId}".`,
    );
  }
}

const seedDocuments = sampleRecords.map((record) => ({
  ref: doc(collection(db, "records")),
  data: {
    title: record.title,
    description: record.description,
    amount: record.amount,
    currency: "CAD",
    timestamp: Date.now() - record.daysAgo * 24 * 60 * 60 * 1000,
    categoryId: doc(db, "categories", record.categoryId),
    paymentMethodId: doc(db, "payment methods", record.paymentMethodId),
    isHidden: false,
  },
}));

for (let offset = 0; offset < seedDocuments.length; offset += 450) {
  const batch = writeBatch(db);
  for (const seed of seedDocuments.slice(offset, offset + 450)) {
    batch.set(seed.ref, seed.data);
  }
  await batch.commit();
}

for (let offset = 0; offset < recordSnapshot.docs.length; offset += 450) {
  const batch = writeBatch(db);
  for (const recordDoc of recordSnapshot.docs.slice(offset, offset + 450)) {
    batch.delete(recordDoc.ref);
  }
  await batch.commit();
}

console.log(
  `Replaced ${recordSnapshot.size} existing record(s) with ${seedDocuments.length} sample record(s). No other collection was modified.`,
);