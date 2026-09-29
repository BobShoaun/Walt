import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "./Category";
import type { PaymentMethod } from "./PaymentMethod";
import { getCategories, getPaymentMethods } from "./firebase";

interface CategoriesContextValue {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  paymentMethodsError: string | null;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null);

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

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        categoriesLoading,
        categoriesError,
        paymentMethods,
        paymentMethodsLoading,
        paymentMethodsError,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return context;
};