export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  timestamp: number;
  category: string;
  paymentType: "credit-card" | "cash" | "bank-transfer" | "debit-card";
  reimbursement?: {
    amount: number;
    reason: string;
  };
  isHidden?: boolean;
}

export const dummyExpenses: Expense[] = [
  {
    id: "1",
    description: "Grocery shopping at Walmart",
    amount: 82.45,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    category: "groceries",
    paymentType: "debit-card",
  },
  {
    id: "2",
    description: "Uber ride to airport",
    amount: 26.75,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    category: "transportation",
    paymentType: "credit-card",
  },
  {
    id: "3",
    description: "Netflix monthly subscription",
    amount: 15.99,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    category: "entertainment",
    paymentType: "credit-card",
  },
  {
    id: "4",
    description: "Coffee at Starbucks",
    amount: 4.85,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    category: "food-and-drinks",
    paymentType: "cash",
  },
  {
    id: "5",
    description: "Gas station refill",
    amount: 52.1,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    category: "transportation",
    paymentType: "debit-card",
  },
  {
    id: "6",
    description: "Dinner date at Italian restaurant",
    amount: 67.3,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    category: "food-and-drinks",
    paymentType: "credit-card",
  },
  {
    id: "7",
    description: "Monthly gym membership",
    amount: 40,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
    category: "health-and-fitness",
    paymentType: "bank-transfer",
  },
  {
    id: "8",
    description: "Electricity bill",
    amount: 120.5,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
    category: "utilities",
    paymentType: "bank-transfer",
  },
  {
    id: "9",
    description: "Movie night tickets",
    amount: 28,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    category: "entertainment",
    paymentType: "credit-card",
  },
  {
    id: "10",
    description: "Donation to charity",
    amount: 25,
    currency: "USD",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
    category: "others",
    paymentType: "debit-card",
  },
];
