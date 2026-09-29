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
  image: string;
  color: string;
}


const categories: Category[] = [
  {
    name: "Food & Drinks",
    id: "food-and-drinks",
    image: "🍉",
    color: ""
  },
  {
    name: "Entertainment",
    id: "entertainment",
    image: "🎮",
    color: ""
  },
  {
    name: "Utilities",
    id: "utilities",
    image: "💡",
    color: ""
  },
  {
    name: "Health & Fitness",
    id: "health-and-fitness",
    image: "💪",
    color: ""
  },
  {
    name: "Transportation",
    id: "transportation",
    image: "🚋",
    color: ""
  },
  {
    name: "Groceries",
    id: "groceries",
    image: "🧺",
    color: ""
  },
  {
    name: "Others",
    id: "others",
    image: "🔶",
    color: ""
  },
];
