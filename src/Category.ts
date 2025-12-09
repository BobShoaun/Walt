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
  slug: string;
  image: string;
  color: string;
}


export const categories: Category[] = [
  {
    name: "Food & Drinks",
    slug: "food-and-drinks",
    image: "🍉",
    color: ""
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    image: "🎮",
    color: ""
  },
  {
    name: "Utilities",
    slug: "utilities",
    image: "💡",
    color: ""
  },
  {
    name: "Health & Fitness",
    slug: "health-and-fitness",
    image: "💪",
    color: ""
  },
  {
    name: "Transportation",
    slug: "transportation",
    image: "🚋",
    color: ""
  },
  {
    name: "Groceries",
    slug: "groceries",
    image: "🧺",
    color: ""
  },
  {
    name: "Others",
    slug: "others",
    image: "🔶",
    color: ""
  },
]