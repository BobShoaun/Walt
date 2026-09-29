export interface Record {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  timestamp: number;
  categoryId: string;
  paymentMethodId: string;
  reimbursement?: {
    amount: number;
    reason: string;
  };
  isHidden?: boolean; // or is redacted?
}

export const dummyRecords: Record[] = [
  {
    id: "1",
    title: "Grocery shopping at Walmart",
    amount: 82.45,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    categoryId: "groceries",
    paymentMethodId: "debit-card",
  },
  {
    id: "2",
    title: "Uber ride to airport",
    amount: 26.75,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    categoryId: "transportation",
    paymentMethodId: "credit-card",
  },
  {
    id: "3",
    title: "Netflix monthly subscription",
    amount: 15.99,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    categoryId: "entertainment",
    paymentMethodId: "credit-card",
  },
  {
    id: "4",
    title: "Coffee at Starbucks",
    amount: 4.85,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    categoryId: "food-and-drinks",
    paymentMethodId: "cash",
  },
  {
    id: "5",
    title: "Gas station refill",
    amount: 52.1,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    categoryId: "transportation",
    paymentMethodId: "debit-card",
  },
  {
    id: "6",
    title: "Dinner date at Italian restaurant",
    amount: 67.3,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    categoryId: "food-and-drinks",
    paymentMethodId: "credit-card",
  },
  {
    id: "7",
    title: "Monthly gym membership",
    amount: 40,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
    categoryId: "health-and-fitness",
    paymentMethodId: "bank-transfer",
  },
  {
    id: "8",
    title: "Electricity bill",
    amount: 120.5,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
    categoryId: "utilities",
    paymentMethodId: "bank-transfer",
  },
  {
    id: "9",
    title: "Movie night tickets",
    amount: 28,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    categoryId: "entertainment",
    paymentMethodId: "credit-card",
  },
  {
    id: "10",
    title: "Donation to charity",
    amount: 25,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
    categoryId: "others",
    paymentMethodId: "debit-card",
  },
];
