import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import { loadEnv } from "vite";

const confirmationFlag = "--confirm-wipe-records";
if (!process.argv.includes(confirmationFlag)) {
  throw new Error(
    `This deletes every document in "records". Re-run with ${confirmationFlag} to confirm.`,
  );
}

const env = loadEnv("development", process.cwd(), "VITE_");
const requiredEnv = (key) => {
  const value = env[key];
  if (!value) throw new Error(`Missing ${key} in .env.local`);
  return value;
};

const app = initializeApp({
  apiKey: requiredEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requiredEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("VITE_FIREBASE_APP_ID"),
});
const db = getFirestore(app);

const [categorySnapshot, paymentMethodSnapshot, recordSnapshot] =
  await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "payment methods")),
    getDocs(collection(db, "records")),
  ]);

if (categorySnapshot.empty || paymentMethodSnapshot.empty) {
  throw new Error(
    'No records were changed: "categories" and "payment methods" must both contain documents.',
  );
}

const categoryIds = new Set(categorySnapshot.docs.map(({ id }) => id));
const paymentMethodIds = new Set(paymentMethodSnapshot.docs.map(({ id }) => id));
const sampleRecords = [
  { title: "Costco Kirkland Signature grocery run", description: "Two dozen eggs, rotisserie chicken, oat milk, frozen blueberries, and a bag of Kirkland espresso beans.", amount: 86.43, categoryId: "groceries", paymentMethodId: "credit-card", daysAgo: 1, hour: 10, minute: 18 },
  { title: "Tim Hortons breakfast combo", description: "Everything bagel toasted with herb-and-garlic cream cheese, a hash brown, and a medium dark roast coffee.", amount: 9.27, categoryId: "food-and-drinks", paymentMethodId: "debit-card", daysAgo: 1, hour: 7, minute: 42 },
  { title: "TTC PRESTO monthly pass", description: "Adult monthly pass loaded onto PRESTO for regular subway and streetcar trips across Toronto.", amount: 156.00, categoryId: "transportation", paymentMethodId: "credit-card", daysAgo: 2, hour: 21, minute: 6 },
  { title: "Shoppers Drug Mart allergy medication", description: "Reactine 24-hour tablets, saline nasal spray, and fragrance-free tissues from the pharmacy counter.", amount: 31.84, categoryId: "health-and-fitness", paymentMethodId: "debit-card", daysAgo: 3, hour: 12, minute: 31 },
  { title: "A&W Teen Burger lunch", description: "Teen Burger combo with onion rings and root beer, ordered for pickup during the workday.", amount: 18.63, categoryId: "food-and-drinks", paymentMethodId: "credit-card", daysAgo: 4, hour: 13, minute: 14 },
  { title: "Netflix Standard monthly plan", description: "Monthly renewal for the Standard streaming plan on the household account.", amount: 18.63, categoryId: "entertainment", paymentMethodId: "credit-card", daysAgo: 5, hour: 2, minute: 9 },
  { title: "Toronto Hydro electricity bill", description: "Monthly electricity statement for the apartment, including delivery charges and applicable tax.", amount: 94.32, categoryId: "utilities", paymentMethodId: "bank-transfer", daysAgo: 6, hour: 9, minute: 3 },
  { title: "Pai Northern Thai Kitchen dinner", description: "Khao soi with chicken, crispy spring rolls, and Thai iced tea for dinner with friends.", amount: 72.48, categoryId: "food-and-drinks", paymentMethodId: "credit-card", daysAgo: 7, hour: 19, minute: 56 },
  { title: "IKEA KALLAX shelf organizers", description: "Two fabric storage boxes and a set of drawer inserts for organizing the KALLAX shelf.", amount: 47.29, categoryId: "others", paymentMethodId: "debit-card", daysAgo: 8, hour: 16, minute: 22 },
  { title: "Farm Boy produce and bakery", description: "Ontario strawberries, baby spinach, sourdough loaf, and a six-pack of Farm Boy butter tarts.", amount: 34.71, categoryId: "groceries", paymentMethodId: "cash", daysAgo: 9, hour: 11, minute: 47 },
  { title: "Cineplex Tuesday movie tickets", description: "Two general admission tickets for an evening screening, booked online with seat selection.", amount: 29.98, categoryId: "entertainment", paymentMethodId: "credit-card", daysAgo: 10, hour: 18, minute: 38 },
  { title: "Uber Eats Thai Express order", description: "Pad see ew with chicken, vegetable spring rolls, and delivery fee for a late dinner at home.", amount: 36.52, categoryId: "food-and-drinks", paymentMethodId: "credit-card", daysAgo: 11, hour: 22, minute: 41 },
  { title: "Bell Fibe internet bill", description: "Monthly Fibe 1.5 internet service charge with modem rental and tax included.", amount: 90.39, categoryId: "utilities", paymentMethodId: "bank-transfer", daysAgo: 12, hour: 8, minute: 26 },
  { title: "GoodLife Fitness monthly membership", description: "Monthly gym membership fee for access to the downtown club and group fitness classes.", amount: 47.45, categoryId: "health-and-fitness", paymentMethodId: "credit-card", daysAgo: 13, hour: 5, minute: 58 },
  { title: "Shell V-Power fuel fill-up", description: "Filled the car with 42 litres of V-Power premium gasoline before a weekend drive.", amount: 82.16, categoryId: "transportation", paymentMethodId: "credit-card", daysAgo: 14, hour: 23, minute: 17 },
  { title: "Dollarama kitchen and cleaning supplies", description: "Dish sponges, compost bags, aluminum foil, freezer labels, and a pack of microfiber cloths.", amount: 22.60, categoryId: "others", paymentMethodId: "cash", daysAgo: 15, hour: 14, minute: 5 },
  { title: "Starbucks oat latte and breakfast sandwich", description: "Grande oat latte with an extra espresso shot and a bacon, gouda, and egg breakfast sandwich.", amount: 13.42, categoryId: "food-and-drinks", paymentMethodId: "debit-card", daysAgo: 16, hour: 6, minute: 33 },
  { title: "Amazon Anker USB-C charger", description: "Anker 735 65W GaN charger for the laptop and phone, including standard shipping.", amount: 52.99, categoryId: "others", paymentMethodId: "credit-card", daysAgo: 17, hour: 15, minute: 49 },
  { title: "Pizza Pizza large pepperoni order", description: "Large classic pepperoni pizza with garlic dipping sauce and delivery for a movie night.", amount: 27.11, categoryId: "food-and-drinks", paymentMethodId: "credit-card", daysAgo: 18, hour: 20, minute: 12 },
  { title: "PRESTO card balance reload", description: "Added twenty-five dollars to the PRESTO card for extra weekday subway and bus trips.", amount: 25.00, categoryId: "transportation", paymentMethodId: "cash", daysAgo: 19, hour: 17, minute: 2 },
  { title: "Rexall sunscreen and vitamins", description: "SPF 50 face sunscreen, vitamin D tablets, and a bottle of unscented hand lotion.", amount: 38.77, categoryId: "health-and-fitness", paymentMethodId: "debit-card", daysAgo: 20, hour: 9, minute: 51 },
  { title: "Spotify Premium family plan", description: "Monthly renewal for the Premium Family plan shared with household members.", amount: 20.99, categoryId: "entertainment", paymentMethodId: "credit-card", daysAgo: 21, hour: 3, minute: 24 },
  { title: "Enbridge Gas natural gas bill", description: "Monthly natural gas usage and delivery charges for heating and hot water.", amount: 67.18, categoryId: "utilities", paymentMethodId: "bank-transfer", daysAgo: 22, hour: 10, minute: 42 },
  { title: "Longo's dinner ingredients", description: "Fresh salmon fillets, lemons, asparagus, baby potatoes, and a carton of 2% milk.", amount: 49.86, categoryId: "groceries", paymentMethodId: "debit-card", daysAgo: 23, hour: 18, minute: 7 },
  { title: "Indigo paperback and notebook", description: "A paperback novel by a Canadian author and a large ruled notebook for work notes.", amount: 35.58, categoryId: "entertainment", paymentMethodId: "credit-card", daysAgo: 24, hour: 12, minute: 59 },
  { title: "Uber ride from Union Station", description: "UberX trip from Union Station to home after the last train arrived late.", amount: 24.73, categoryId: "transportation", paymentMethodId: "credit-card", daysAgo: 25, hour: 0, minute: 36 },
  { title: "Canadian Tire LED bulbs and batteries", description: "Two warm-white LED bulbs, AA rechargeable batteries, and a small pack of picture hooks.", amount: 41.20, categoryId: "others", paymentMethodId: "debit-card", daysAgo: 26, hour: 16, minute: 44 },
  { title: "McDonald's McCrispy combo", description: "McCrispy chicken sandwich combo with medium fries and unsweetened iced tea.", amount: 15.81, categoryId: "food-and-drinks", paymentMethodId: "cash", daysAgo: 27, hour: 11, minute: 26 },
  { title: "ROM Friday evening admission", description: "Two after-hours general admission tickets to explore the galleries and special exhibits.", amount: 52.00, categoryId: "entertainment", paymentMethodId: "credit-card", daysAgo: 28, hour: 19, minute: 8 },
  { title: "Rogers wireless monthly bill", description: "Monthly mobile plan for one line with 100 GB of Canada-wide data and device financing.", amount: 78.53, categoryId: "utilities", paymentMethodId: "bank-transfer", daysAgo: 29, hour: 7, minute: 11 },
  { title: "Pet Valu cat food and litter", description: "Two bags of Hill's Science Diet adult cat food and one clumping litter refill.", amount: 63.92, categoryId: "others", paymentMethodId: "debit-card", daysAgo: 30, hour: 13, minute: 53 },
  { title: "FreshCo weekly pantry shop", description: "Jasmine rice, canned chickpeas, pasta, tomato sauce, bananas, and store-brand yogurt.", amount: 58.34, categoryId: "groceries", paymentMethodId: "credit-card", daysAgo: 31, hour: 17, minute: 36 },
  { title: "GO Transit weekend day pass", description: "Weekend day pass for a round trip from Union Station to visit family in Oakville.", amount: 10.00, categoryId: "transportation", paymentMethodId: "debit-card", daysAgo: 32, hour: 8, minute: 2 },
  { title: "Home Depot wall anchors and paint", description: "A small can of eggshell white paint, roller covers, and drywall anchors for the hallway.", amount: 54.19, categoryId: "others", paymentMethodId: "credit-card", daysAgo: 33, hour: 15, minute: 27 },
  { title: "SkipTheDishes sushi dinner", description: "Salmon avocado rolls, miso soup, and edamame from the local sushi restaurant, delivered.", amount: 43.68, categoryId: "food-and-drinks", paymentMethodId: "credit-card", daysAgo: 34, hour: 21, minute: 33 },
  { title: "Adidas running socks at Sport Chek", description: "Three-pack of Adidas cushioned crew running socks for weekday treadmill workouts.", amount: 19.99, categoryId: "health-and-fitness", paymentMethodId: "debit-card", daysAgo: 35, hour: 10, minute: 7 },
  { title: "Adobe Lightroom Photography plan", description: "Monthly Lightroom subscription renewal for editing and cloud backup of camera photos.", amount: 14.99, categoryId: "entertainment", paymentMethodId: "credit-card", daysAgo: 36, hour: 1, minute: 18 },
  { title: "LCBO Ontario Pinot Noir", description: "One bottle of Ontario Pinot Noir and a bottle of sparkling water for a dinner party.", amount: 28.95, categoryId: "food-and-drinks", paymentMethodId: "debit-card", daysAgo: 37, hour: 18, minute: 49 },
  { title: "Presto parking at Finch Station", description: "Daily parking fee at Finch GO and TTC commuter lot before taking the subway downtown.", amount: 7.00, categoryId: "transportation", paymentMethodId: "cash", daysAgo: 38, hour: 6, minute: 54 },
  { title: "Staples HP printer paper and ink", description: "One ream of letter-size multipurpose paper and an HP 67 black ink cartridge for home printing.", amount: 71.46, categoryId: "others", paymentMethodId: "credit-card", daysAgo: 39, hour: 14, minute: 38 },
];

for (const record of sampleRecords) {
  if (!categoryIds.has(record.categoryId)) {
    throw new Error(
      `No records were changed: missing category "${record.categoryId}".`,
    );
  }
  if (!paymentMethodIds.has(record.paymentMethodId)) {
    throw new Error(
      `No records were changed: missing payment method "${record.paymentMethodId}".`,
    );
  }
}

const seedDocuments = sampleRecords.map((record) => ({
  ref: doc(collection(db, "records")),
  data: {
    title: record.title,
    description: record.description,
    amount: record.amount,
    currency: "CAD",
    timestamp: (() => {
      const recordDate = new Date();
      recordDate.setDate(recordDate.getDate() - record.daysAgo);
      recordDate.setHours(record.hour, record.minute, 0, 0);
      return recordDate.getTime();
    })(),
    categoryId: doc(db, "categories", record.categoryId),
    paymentMethodId: doc(db, "payment methods", record.paymentMethodId),
  },
}));

for (let offset = 0; offset < seedDocuments.length; offset += 450) {
  const batch = writeBatch(db);
  for (const seed of seedDocuments.slice(offset, offset + 450)) {
    batch.set(seed.ref, seed.data);
  }
  await batch.commit();
}

for (let offset = 0; offset < recordSnapshot.docs.length; offset += 450) {
  const batch = writeBatch(db);
  for (const recordDoc of recordSnapshot.docs.slice(offset, offset + 450)) {
    batch.delete(recordDoc.ref);
  }
  await batch.commit();
}

console.log(
  `Replaced ${recordSnapshot.size} existing record(s) with ${seedDocuments.length} sample record(s). No other collection was modified.`,
);