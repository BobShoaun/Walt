/**
 * 
 * Food & Drinks
 *  - Groceries
 *  - Restaurant
 *  - Cafe & Coffee shops
 * 
 * Housing
 * - Rent
 * - Mortgage
 * - Utilities
 * - Furniture
 * - Insurance
 * 
 * Transportation
 * - Public transport
 * - Taxi
 * - Flight
 * - Train
 * - Vehicle rental
 * - Fuel
 * - Vehicle maintenance 
 * 
 * Travel & Vacation
 * - Flight
 * - Hotel, Lodging
 * - Taxi
 * - Logistics, insurance, baggage fees
 * 
 * 
 * Personal care & Fashion
 * - Haircut
 * - Laundry
 * - Clothes
 * - Shoes
 * - Accessories, jewelry
 * 
 * 
 * Leisure & Entertainment
 * - Nightclub, Parties
 * - Hobbies
 * - Media & Streaming
 * - Gifts, charity
 * - Cinema
 * - Alcohol, drugs
 * - Games
 * - Sports, fitness
 * - Toys
 * - Concerts
 * 
 * Education & Personal Growth
 * - Tuition & Courses
 * - Books
 * - Conference & Workshops
 * 
 *
 * Tools, Tech
 * - Software
 * - Stationary
 * - Electronics
 * - Hardware
 * 
 * 
 * Communication
 * - Internet
 * - Cellular plan
 * - Postal & Shipping
 * 
 * 
 * Healthcare & Medical
 * - Dentist
 * - Doctor
 * - Drugs, medicine
 * - Insurance
 * 
 * 
 * Financial
 * - Credit card fees
 * - Banking fees
 * - Fines
 * 
 * Government
 * - Taxes
 * - Immigration
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
