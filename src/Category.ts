/**
 * 
 * Food & Drinks
 *  - Groceries
 *  - Restaurant
 *  - Bar, cafe
 * 
 * Housing
 * - Rent
 * - Mortgage
 * - Energy, utilities
 * - Furniture
 * 
 * Transportation
 * - Public transport
 * - Taxi
 * - Long distance
 * 
 * 
 * Government
 * - Visa
 * 
 * 
 * Life & Entertainment
 * - Party
 * - Club
 * - Hobbies
 * 
 * 
 * Laundry
 * 
 * 
 */

export interface Category {
  name: string;
  id: string;
  icon: string;
  color: string;
}


const categories: Category[] = [
  {
    name: "Food & Drinks",
    id: "food-and-drinks",
    icon: "🍉",
    color: ""
  },
  {
    name: "Entertainment",
    id: "entertainment",
    icon: "🎮",
    color: ""
  },
  {
    name: "Utilities",
    id: "utilities",
    icon: "💡",
    color: ""
  },
  {
    name: "Health & Fitness",
    id: "health-and-fitness",
    icon: "💪",
    color: ""
  },
  {
    name: "Transportation",
    id: "transportation",
    icon: "🚋",
    color: ""
  },
  {
    name: "Groceries",
    id: "groceries",
    icon: "🧺",
    color: ""
  },
  {
    name: "Others",
    id: "others",
    icon: "🔶",
    color: ""
  },
];
