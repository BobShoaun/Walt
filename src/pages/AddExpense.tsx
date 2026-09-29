import { paymentMethods } from "../PaymentMethod";
import { useNavigate } from "react-router-dom";

import { useState } from "react";

import { addExpense as addExpenseToFirebase } from "../firebase";
import { useCategories } from "../CategoryContext.tsx";

const AddExpense = () => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  const [category, setCategory] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addExpense = async () => {
    console.log("adding expense...");
    setSubmitError(null);
    const selectedCategory = categories.find(({ id }) => id === category);
    if (!selectedCategory) {
      setSubmitError("Select a valid category.");
      return;
    }

    try {
      await addExpenseToFirebase({
        id: "", // Firebase will generate an ID
        title,
        description,
        amount,
        currency: "CAD",
        category,
        timestamp: timestamp.getTime(),
        paymentType: "credit-card",
      }, selectedCategory);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add expense.");
    }
  };

  const canAddExpense = () => {
    return title.length > 0 && category.length > 0;
  }

  return (
    <main className="p-2 h-full">
      <form
        action=""
        onSubmit={async (e) => {
          e.preventDefault();
          // navigate("/")
          await addExpense();
        }}
        className="flex flex-col gap-4"
      >
        <div className="">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            name="amount"
            id="amount"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.valueAsNumber)}
            className="block border border-gray-300 shadow-inner w-full px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            name="category"
            id="category"
            value={category}
            disabled={categoriesLoading || categories.length === 0}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full border border-gray-300 px-3 py-2 mt-1 shadow-inner cursor-pointer"
          >
            <option value="" disabled>
              {categoriesLoading ? "Loading categories..." : "Select a category"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.image} {category.name}
              </option>
            ))}
          </select>
        </div>
        {categoriesError && (
          <p role="alert" className="text-red-700">
            {categoriesError}
          </p>
        )}

         <div>
          <label htmlFor="title">Title</label>
          <input
            name="title"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block border border-gray-300 shadow-inner w-full px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 block border border-gray-300 shadow-inner w-full resize-none h-20 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="payment-method">Payment Method</label>
          <select
            name="payment-method"
            className="block w-full border border-gray-300 px-3 py-2 cursor-pointer mt-1 shadow-inner"
          >
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.slug}>{paymentMethod.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="timestamp">Date & Time</label>
          <input
            type="datetime-local"
            name="timestamp"
            id="timestamp"
            value={new Date(
              timestamp.getTime() - timestamp.getTimezoneOffset() * 60_000,
            )
              .toISOString()
              .slice(0, 16)}
            onChange={(e) => {
              if (e.target.value) setTimestamp(new Date(e.target.value));
            }}
            className="mt-1 w-full block border border-gray-300 shadow-inner px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={!canAddExpense()}
          className="w-full bg-indigo-200 text-indigo-800 py-2 border border-indigo-700 
          cursor-pointer disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Add Expense
        </button>
        {submitError && (
          <p role="alert" className="text-red-700">
            {submitError}
          </p>
        )}
      </form>
    </main>
  );
};

export default AddExpense;
