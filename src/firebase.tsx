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
} from "firebase/firestore";

import type { Expense } from "./Expense";
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

export const addExpense = async (
  expense: Expense,
  category: Category,
  paymentMethod: PaymentMethod,
) => {
 try {
    if (category.id !== expense.categoryId) {
      throw new Error(`Unknown category: ${expense.categoryId}`);
    }
    if (paymentMethod.id !== expense.paymentMethodId) {
      throw new Error(`Unknown payment method: ${expense.paymentMethodId}`);
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

    const docRef = await addDoc(collection(db, "expenses"), {
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      timestamp: expense.timestamp,
      currency: expense.currency,
      categoryId: categoryRef,
      paymentMethodId: paymentMethodRef,
    });

    console.log("Document written with ID: ", docRef.id);

    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);

    throw e; // Re-throw the error for further handling
  }
}

