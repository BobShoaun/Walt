// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteField,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

import type { Record } from "./Record";
import type { Category } from "./Category";
import type { PaymentMethod } from "./PaymentMethod";

const requiredEnv = (key: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const firebaseConfig = {
  apiKey: requiredEnv("VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: requiredEnv("VITE_FIREBASE_AUTH_DOMAIN", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: requiredEnv("VITE_FIREBASE_PROJECT_ID", import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: requiredEnv("VITE_FIREBASE_STORAGE_BUCKET", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: requiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: requiredEnv("VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export const getCategories = async (): Promise<Category[]> => {
  const categorySnapshot = await getDocs(collection(db, "categories"));
  return categorySnapshot.docs.map((categoryDoc) => ({
    ...categoryDoc.data(),
    id: categoryDoc.id,
  }) as Category);
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const paymentMethodSnapshot = await getDocs(collection(db, "payment methods"));
  return paymentMethodSnapshot.docs.map((paymentMethodDoc) => ({
    ...paymentMethodDoc.data(),
    id: paymentMethodDoc.id,
  }) as PaymentMethod);
};

const getReferenceId = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string"
  ) {
    return value.id;
  }
  return "";
};

export const getRecords = async (): Promise<Record[]> => {
  const recordSnapshot = await getDocs(collection(db, "records"));
  return recordSnapshot.docs.map((recordDoc) => {
    const data = recordDoc.data();
    const timestamp =
      data.timestamp instanceof Timestamp
        ? data.timestamp.toMillis()
        : data.timestamp;
    return {
      ...data,
      id: recordDoc.id,
      timestamp,
      categoryId: getReferenceId(data.categoryId ?? data.category),
      paymentMethodId: getReferenceId(
        data.paymentMethodId ?? data.paymentType,
      ),
    } as Record;
  });
};

export const addRecord = async (
  record: Record,
  category: Category,
  paymentMethod: PaymentMethod,
) => {
 try {
    if (category.id !== record.categoryId) {
      throw new Error(`Unknown category: ${record.categoryId}`);
    }
    if (paymentMethod.id !== record.paymentMethodId) {
      throw new Error(`Unknown payment method: ${record.paymentMethodId}`);
    }

    const categoryRef = doc(db, "categories", category.id);
    const categorySnapshot = await getDoc(categoryRef);
    if (!categorySnapshot.exists()) {
      await setDoc(categoryRef, {
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
    } else if (categorySnapshot.get("id") !== undefined) {
      await updateDoc(categoryRef, { id: deleteField() });
    }

    const paymentMethodRef = doc(db, "payment methods", paymentMethod.id);
    const paymentMethodSnapshot = await getDoc(paymentMethodRef);
    if (!paymentMethodSnapshot.exists()) {
      await setDoc(paymentMethodRef, {
        name: paymentMethod.name,
        icon: paymentMethod.icon,
      });
    } else if (
      paymentMethodSnapshot.get("slug") !== undefined ||
      paymentMethodSnapshot.get("id") !== undefined
    ) {
      await updateDoc(paymentMethodRef, {
        slug: deleteField(),
        id: deleteField(),
      });
    }

    const docRef = await addDoc(collection(db, "records"), {
      title: record.title,
      description: record.description,
      amount: record.amount,
      timestamp: record.timestamp,
      currency: record.currency,
      categoryId: categoryRef,
      paymentMethodId: paymentMethodRef,
      isHidden: record.isHidden ?? false,
    });

    console.log("Document written with ID: ", docRef.id);

    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);

    throw e; // Re-throw the error for further handling
  }
}

