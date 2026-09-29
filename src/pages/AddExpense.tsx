import { useNavigate } from "react-router-dom";

import { useState } from "react";

import { addExpense as addExpenseToFirebase } from "../firebase";
import { useCategories } from "../CategoryContext.tsx";

const AddExpense = () => {
  const navigate = useNavigate();
  const {
    categories,
    categoriesLoading,
    categoriesError,
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
  } = useCategories();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addExpense = async () => {
    console.log("adding expense...");
    setSubmitError(null);
    if (!Number.isFinite(amount) || amount < 0) {
      setSubmitError("Enter a valid non-negative amount.");
      return;
    }

    const selectedCategory = categories.find(({ id }) => id === category);
    if (!selectedCategory) {
      setSubmitError("Select a valid category.");
      return;
    }
    const selectedPaymentMethod = paymentMethods.find(
      ({ id }) => id === paymentMethodId,
    );
    if (!selectedPaymentMethod) {
      setSubmitError("Select a valid payment method.");
      return;
    }

    try {
      await addExpenseToFirebase({
        id: "", // Firebase will generate an ID
        title,
        description,
        amount,
        currency: "CAD",
        categoryId: category,
        timestamp: timestamp.getTime(),
        paymentMethodId,
      }, selectedCategory, selectedPaymentMethod);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add expense.");
    }
  };

  const canAddExpense = () => {
    return true;
    // return title.length > 0 && category.length > 0 && Number.isFinite(amount) && amount >= 0;
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
            step="0.01"
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
            required
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
                {category.icon} {category.name}
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
            required
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
            id="payment-method"
            required
            value={paymentMethodId}
            disabled={paymentMethodsLoading || paymentMethods.length === 0}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            className="block w-full border border-gray-300 px-3 py-2 cursor-pointer mt-1 shadow-inner"
          >
            <option value="" disabled>
              {paymentMethodsLoading ? "Loading payment methods..." : "Select a payment method"}
            </option>
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.icon} {paymentMethod.name}
              </option>
            ))}
          </select>
        </div>
        {paymentMethodsError && (
          <p role="alert" className="text-red-700">
            {paymentMethodsError}
          </p>
        )}

        <div>
          <label htmlFor="timestamp">Date & Time</label>
          <input
            type="datetime-local"
            name="timestamp"
            id="timestamp"
            required
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
