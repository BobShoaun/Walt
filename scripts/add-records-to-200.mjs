import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
} from "firebase/firestore";
import { loadEnv } from "vite";

const confirmationFlag = "--confirm-add-records";
if (!process.argv.includes(confirmationFlag)) {
  throw new Error(
    `This adds placeholder documents to "records" without deleting existing data. Re-run with ${confirmationFlag} to confirm.`,
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
const targetCount = 200;
const now = new Date();

const [categorySnapshot, paymentMethodSnapshot, recordSnapshot] =
  await Promise.all([
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "payment methods")),
    getDocs(collection(db, "records")),
  ]);

if (recordSnapshot.size >= targetCount) {
  console.log(`Already have ${recordSnapshot.size} records; no data was changed.`);
  process.exit(0);
}
if (categorySnapshot.empty || paymentMethodSnapshot.empty) {
  throw new Error(
    'No records were added: "categories" and "payment methods" must both contain documents.',
  );
}

const categoryIds = new Set(categorySnapshot.docs.map(({ id }) => id));
const paymentMethodIds = new Set(paymentMethodSnapshot.docs.map(({ id }) => id));
const findCollectionId = (snapshot, options, label) => {
  const byId = (ids) => snapshot.docs.find((document) => ids.includes(document.id));
  const byName = (names) =>
    snapshot.docs.find((document) =>
      names.includes(String(document.data().name ?? "").trim().toLowerCase()),
    );
  const match =
    byId(options.ids ?? []) ??
    byName(options.names ?? []) ??
    byId(options.fallbackIds ?? []) ??
    byName(options.fallbackNames ?? []);
  if (!match) {
    throw new Error(`No records were added: no ${label} document is available.`);
  }
  return match.id;
};

const categoryOptions = (ids, names, fallbackIds = ["others"], fallbackNames = ["others"]) => ({
  ids,
  names: names.map((name) => name.toLowerCase()),
  fallbackIds,
  fallbackNames: fallbackNames.map((name) => name.toLowerCase()),
});
const paymentMethodOptions = (ids, names, fallbackIds, fallbackNames) => ({
  ids,
  names: names.map((name) => name.toLowerCase()),
  fallbackIds,
  fallbackNames: fallbackNames.map((name) => name.toLowerCase()),
});

const rentCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["housing", "rent"], ["housing", "rent"]),
  "rent category",
);
const utilityCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["utilities"], ["utilities"]),
  "utility category",
);
const groceryCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["groceries"], ["groceries"]),
  "grocery category",
);
const foodCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["food-and-drinks"], ["food & drinks", "food and drinks"]),
  "food category",
);
const entertainmentCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["entertainment"], ["entertainment"]),
  "entertainment category",
);
const healthCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["health-and-fitness"], ["health & fitness", "health and fitness"]),
  "health category",
);
const transitCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["transportation"], ["transportation"]),
  "transportation category",
);
const otherCategoryId = findCollectionId(
  categorySnapshot,
  categoryOptions(["others"], ["others"], [], []),
  "general category",
);

const bankTransferId = findCollectionId(
  paymentMethodSnapshot,
  paymentMethodOptions(
    ["bank-transfer"],
    ["bank transfer"],
    ["debit-card", "credit-card", "cash"],
    ["debit card", "credit card", "cash"],
  ),
  "bank-transfer payment method",
);
const creditCardId = findCollectionId(
  paymentMethodSnapshot,
  paymentMethodOptions(
    ["credit-card"],
    ["credit card"],
    ["debit-card", "bank-transfer", "cash"],
    ["debit card", "bank transfer", "cash"],
  ),
  "credit-card payment method",
);
const debitCardId = findCollectionId(
  paymentMethodSnapshot,
  paymentMethodOptions(
    ["debit-card"],
    ["debit card"],
    ["credit-card", "cash", "bank-transfer"],
    ["credit card", "cash", "bank transfer"],
  ),
  "debit-card payment method",
);
const cashId = findCollectionId(
  paymentMethodSnapshot,
  paymentMethodOptions(
    ["cash"],
    ["cash"],
    ["debit-card", "credit-card", "bank-transfer"],
    ["debit card", "credit card", "bank transfer"],
  ),
  "cash payment method",
);

const months = Array.from({ length: now.getMonth() - 3 + 1 }, (_, index) =>
  new Date(now.getFullYear(), index + 3, 1),
);
const monthLabel = (date) =>
  date.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
const timestampFor = (monthDate, day, hour, minute) => {
  const lastDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const boundedDay = Math.min(day, lastDay);
  const timestamp = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    boundedDay,
    hour,
    minute,
    0,
    0,
  ).getTime();
  return Math.min(timestamp, now.getTime() - 60_000);
};

const monthlyBills = [];
for (const [monthIndex, monthDate] of months.entries()) {
  const label = monthLabel(monthDate);
  const recurring = [
    {
      title: `${label} rent - Mapleview Apartments`,
      description: `Monthly apartment rent paid to Mapleview Properties for the two-bedroom unit, including the storage locker.`,
      amount: 2180 + monthIndex * 20,
      categoryId: rentCategoryId,
      paymentMethodId: bankTransferId,
      day: 1,
      hour: 8,
      minute: 12 + monthIndex * 5,
    },
    {
      title: `${label} Bell Mobility phone bill`,
      description: `Bell Mobility monthly service for one line with 100 GB of Canada-wide data, voicemail, and device financing.`,
      amount: 78.53,
      categoryId: utilityCategoryId,
      paymentMethodId: creditCardId,
      day: 4,
      hour: 11,
      minute: 7 + monthIndex * 7,
    },
    {
      title: `${label} TD Visa statement payment`,
      description: `Payment toward the TD Cashback Visa statement balance for restaurant, grocery, transit, and household purchases.`,
      amount: 462.18 + monthIndex * 37.29,
      categoryId: otherCategoryId,
      paymentMethodId: bankTransferId,
      day: 7,
      hour: 16,
      minute: 22 + monthIndex * 3,
    },
    {
      title: `${label} Rogers Ignite internet bill`,
      description: `Rogers Ignite internet service with modem rental and tax for the home Wi-Fi connection.`,
      amount: 90.39,
      categoryId: utilityCategoryId,
      paymentMethodId: bankTransferId,
      day: 10,
      hour: 9,
      minute: 34 + monthIndex * 4,
    },
    {
      title: `${label} Toronto Hydro electricity bill`,
      description: `Toronto Hydro monthly electricity statement with delivery charges and provincial tax for the apartment.`,
      amount: 82.47 + monthIndex * 4.31,
      categoryId: utilityCategoryId,
      paymentMethodId: bankTransferId,
      day: 14,
      hour: 13,
      minute: 9 + monthIndex * 6,
    },
    {
      title: `${label} Netflix Standard subscription`,
      description: `Monthly renewal of the household Netflix Standard plan for television and movie streaming.`,
      amount: 18.63,
      categoryId: entertainmentCategoryId,
      paymentMethodId: creditCardId,
      day: 19,
      hour: 2,
      minute: 17 + monthIndex * 5,
    },
  ];

  for (const bill of recurring) {
    monthlyBills.push({
      ...bill,
      timestamp: timestampFor(monthDate, bill.day, bill.hour, bill.minute),
    });
  }
}

const purchaseTemplates = [
  { title: "Costco Kirkland Signature pantry restock", description: "Kirkland olive oil, basmati rice, canned tomatoes, free-range eggs, and a box of organic baby spinach.", amount: 64.83, categoryId: groceryCategoryId, paymentMethodId: creditCardId },
  { title: "Loblaws PC Blue Menu grocery shop", description: "Chicken thighs, whole wheat wraps, Greek yogurt, strawberries, and PC Blue Menu frozen vegetables.", amount: 53.76, categoryId: groceryCategoryId, paymentMethodId: debitCardId },
  { title: "Farm Boy bakery and produce", description: "Sourdough loaf, Ontario peaches, baby spinach, farm eggs, and a box of butter tarts from the bakery counter.", amount: 32.48, categoryId: groceryCategoryId, paymentMethodId: cashId },
  { title: "No Frills pantry staples", description: "Jasmine rice, Barilla penne, Mutti tomato passata, canned chickpeas, and Fairlife 2% milk.", amount: 41.22, categoryId: groceryCategoryId, paymentMethodId: debitCardId },
  { title: "Tim Hortons breakfast sandwich", description: "Bacon, egg, and cheese breakfast sandwich with a medium dark roast coffee and hash brown.", amount: 11.36, categoryId: foodCategoryId, paymentMethodId: debitCardId },
  { title: "Starbucks oat latte and cake pop", description: "Grande oat latte with an extra espresso shot and a birthday cake pop during an afternoon break.", amount: 10.74, categoryId: foodCategoryId, paymentMethodId: creditCardId },
  { title: "A&W Teen Burger combo", description: "Teen Burger combo with onion rings and a root beer, ordered for pickup after work.", amount: 18.63, categoryId: foodCategoryId, paymentMethodId: creditCardId },
  { title: "Pai Northern Thai Kitchen takeout", description: "Khao soi with chicken, crispy spring rolls, and Thai iced tea packed for dinner at home.", amount: 34.81, categoryId: foodCategoryId, paymentMethodId: creditCardId },
  { title: "Shoppers Drug Mart Reactine and tissues", description: "Reactine 24-hour allergy tablets, saline nasal spray, and a large box of fragrance-free tissues.", amount: 29.67, categoryId: healthCategoryId, paymentMethodId: debitCardId },
  { title: "Rexall vitamin D and sunscreen", description: "Vitamin D3 tablets and SPF 50 facial sunscreen for daily use during outdoor walks.", amount: 36.28, categoryId: healthCategoryId, paymentMethodId: creditCardId },
  { title: "GoodLife Fitness day pass", description: "Single-day access to the downtown GoodLife club, including the weight room and pool.", amount: 22.00, categoryId: healthCategoryId, paymentMethodId: creditCardId },
  { title: "PRESTO card reload", description: "Added funds to the PRESTO card for subway, streetcar, and bus rides across the city.", amount: 30.00, categoryId: transitCategoryId, paymentMethodId: cashId },
  { title: "Shell V-Power fuel fill-up", description: "Filled the car with 38 litres of Shell V-Power premium gasoline before a weekend trip.", amount: 76.42, categoryId: transitCategoryId, paymentMethodId: creditCardId },
  { title: "Uber ride from Union Station", description: "UberX trip from Union Station to home after the late train arrived following midnight.", amount: 23.56, categoryId: transitCategoryId, paymentMethodId: creditCardId },
  { title: "Cineplex movie tickets and snacks", description: "Two evening admission tickets, a regular popcorn, and two fountain drinks for a Friday screening.", amount: 48.72, categoryId: entertainmentCategoryId, paymentMethodId: creditCardId },
  { title: "Spotify Premium Family renewal", description: "Monthly Spotify Premium Family plan renewal for music streaming across household devices.", amount: 20.99, categoryId: entertainmentCategoryId, paymentMethodId: creditCardId },
  { title: "IKEA KALLAX storage boxes", description: "Two grey fabric storage boxes and a set of drawer inserts sized for the living-room KALLAX shelf.", amount: 44.19, categoryId: otherCategoryId, paymentMethodId: debitCardId },
  { title: "Canadian Tire LED bulbs and batteries", description: "Two warm-white LED bulbs, AA rechargeable batteries, and picture hooks for the hallway.", amount: 39.87, categoryId: otherCategoryId, paymentMethodId: creditCardId },
  { title: "Home Depot paint and roller covers", description: "A small can of eggshell-white interior paint, two roller covers, and drywall anchors for touch-ups.", amount: 57.63, categoryId: otherCategoryId, paymentMethodId: debitCardId },
  { title: "Amazon Anker USB-C charger", description: "Anker 735 65W GaN charger for a laptop and phone, including standard shipping and tax.", amount: 52.99, categoryId: otherCategoryId, paymentMethodId: creditCardId },
  { title: "Dollarama cleaning supplies", description: "Dish sponges, compost bags, aluminum foil, microfiber cloths, and freezer labels for the kitchen.", amount: 24.82, categoryId: otherCategoryId, paymentMethodId: cashId },
  { title: "LCBO Ontario Pinot Noir", description: "One bottle of Ontario Pinot Noir and sparkling water for dinner with friends.", amount: 27.95, categoryId: foodCategoryId, paymentMethodId: debitCardId },
  { title: "Pet Valu Hill's Science Diet cat food", description: "One bag of Hill's Science Diet adult cat food and a clumping litter refill for the household cat.", amount: 61.48, categoryId: otherCategoryId, paymentMethodId: debitCardId },
  { title: "Staples HP printer paper and ink", description: "One ream of letter-size multipurpose paper and an HP 67 black ink cartridge for the home printer.", amount: 69.24, categoryId: otherCategoryId, paymentMethodId: creditCardId },
  { title: "Indigo paperback and ruled notebook", description: "A paperback novel by a Canadian author and a large ruled notebook for meeting notes.", amount: 31.87, categoryId: entertainmentCategoryId, paymentMethodId: creditCardId },
  { title: "FreshCo bananas and coffee", description: "Bananas, a bag of Nabob medium-roast coffee, and a carton of Natrel 2% milk.", amount: 18.49, categoryId: groceryCategoryId, paymentMethodId: cashId },
  { title: "McDonald's McCrispy lunch combo", description: "McCrispy chicken sandwich combo with medium fries and unsweetened iced tea.", amount: 15.81, categoryId: foodCategoryId, paymentMethodId: cashId },
  { title: "Sport Chek Adidas running socks", description: "Three-pack of Adidas cushioned crew running socks for weekday treadmill workouts.", amount: 19.99, categoryId: healthCategoryId, paymentMethodId: debitCardId },
  { title: "Petro-Canada car wash", description: "Touchless premium wash with underbody rinse and wheel cleaning after a week of rain.", amount: 18.00, categoryId: transitCategoryId, paymentMethodId: creditCardId },
  { title: "Best Buy Logitech wireless mouse", description: "Logitech M720 Triathlon wireless mouse for switching between the work laptop and home desktop.", amount: 57.61, categoryId: otherCategoryId, paymentMethodId: creditCardId },
];

const requiredCount = targetCount - recordSnapshot.size;
const additionalRecords = [...monthlyBills];
let purchaseIndex = 0;

while (additionalRecords.length < requiredCount) {
  const template = purchaseTemplates[purchaseIndex % purchaseTemplates.length];
  const monthDate = months[(purchaseIndex * 5) % months.length];
  const monthName = monthLabel(monthDate);
  const repeatNumber = Math.floor(purchaseIndex / purchaseTemplates.length);
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const day = 1 + ((purchaseIndex * 7 + 3) % daysInMonth);
  const hour = (purchaseIndex * 7 + 6) % 24;
  const minute = (purchaseIndex * 19 + 11) % 60;
  const repeatSuffix = repeatNumber > 0 ? ` - visit ${repeatNumber + 1}` : "";

  additionalRecords.push({
    ...template,
    title: `${template.title}${repeatSuffix}`,
    description: `${template.description} Logged during ${monthName}.`,
    amount: Number((template.amount + repeatNumber * 1.13).toFixed(2)),
    timestamp: timestampFor(monthDate, day, hour, minute),
  });
  purchaseIndex += 1;
}

const recordsToAdd = additionalRecords.slice(0, requiredCount);
for (const record of recordsToAdd) {
  if (!categoryIds.has(record.categoryId)) {
    throw new Error(
      `No records were added: missing category "${record.categoryId}".`,
    );
  }
  if (!paymentMethodIds.has(record.paymentMethodId)) {
    throw new Error(
      `No records were added: missing payment method "${record.paymentMethodId}".`,
    );
  }
}

for (let offset = 0; offset < recordsToAdd.length; offset += 450) {
  const batch = writeBatch(db);
  for (const record of recordsToAdd.slice(offset, offset + 450)) {
    batch.set(doc(collection(db, "records")), {
      title: record.title,
      description: record.description,
      amount: record.amount,
      currency: "CAD",
      timestamp: record.timestamp,
      categoryId: doc(db, "categories", record.categoryId),
      paymentMethodId: doc(db, "payment methods", record.paymentMethodId),
      isHidden: false,
    });
  }
  await batch.commit();
}

console.log(
  `Added ${recordsToAdd.length} record(s). The collection now contains ${recordSnapshot.size + recordsToAdd.length} total records. No existing records or other collections were modified.`,
);
