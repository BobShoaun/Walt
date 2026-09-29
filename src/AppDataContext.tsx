import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "./Category";
import type { Record } from "./Record";
import type { PaymentMethod } from "./PaymentMethod";
import { getCategories, getRecords, getPaymentMethods } from "./firebase";

interface AppDataContextValue {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;
  records: Record[];
  recordsLoading: boolean;
  recordsError: string | null;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((loadedCategories) => {
        if (isMounted) setCategories(loadedCategories);
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          setCategoriesError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load categories.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setCategoriesLoading(false);
      });

    getPaymentMethods()
      .then((loadedPaymentMethods) => {
        if (isMounted) setPaymentMethods(loadedPaymentMethods);
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          setPaymentMethodsError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load payment methods.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setPaymentMethodsLoading(false);
      });

    getRecords()
      .then((loadedRecords) => {
        if (isMounted) setRecords(loadedRecords);
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          setRecordsError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load records.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setRecordsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        categories,
        categoriesLoading,
        categoriesError,
        paymentMethods,
        paymentMethodsLoading,
        paymentMethodsError,
        records,
        recordsLoading,
        recordsError,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
};