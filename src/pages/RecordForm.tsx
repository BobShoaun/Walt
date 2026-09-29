import { useNavigate, useParams } from "react-router-dom";

import { useEffect, useState } from "react";

import { saveRecord as saveRecordToFirebase } from "../firebase";
import { useAppData } from "../AppDataContext.tsx";

const RecordForm = () => {
  const navigate = useNavigate();
  const {
    categories,
    categoriesLoading,
    categoriesError,
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodsError,
    records,
    recordsLoading,
    refreshRecords,
  } = useAppData();
  const { recordId } = useParams();
  const isEditing = Boolean(recordId);
  const existingRecord = records.find((record) => record.id === recordId);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!existingRecord) return;
    setTitle(existingRecord.title);
    setDescription(existingRecord.description ?? "");
    setAmount(existingRecord.amount);
    setTimestamp(new Date(existingRecord.timestamp));
    setIsHidden(existingRecord.isHidden ?? false);
    setPaymentMethodId(existingRecord.paymentMethodId);
    setCategory(existingRecord.categoryId);
  }, [existingRecord]);

  const addRecord = async () => {
    console.log(isEditing ? "updating record..." : "adding record...");
    setSubmitError(null);
    if (isEditing && !existingRecord) {
      setSubmitError("Record not found.");
      return;
    }
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
      await saveRecordToFirebase({
        id: existingRecord?.id ?? "",
        title,
        description,
        amount,
        currency: "CAD",
        categoryId: category,
        timestamp: timestamp.getTime(),
        paymentMethodId,
        isHidden,
      }, selectedCategory, selectedPaymentMethod);
      await refreshRecords();
      navigate("/");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save record.");
    }
  };

  const canAddRecord = () => {
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
          await addRecord();
        }}
        className="flex flex-col gap-4"
      >
        {isEditing && recordsLoading && <p>Loading record...</p>}
        {isEditing && !recordsLoading && !existingRecord && (
          <p role="alert" className="text-red-700">Record not found.</p>
        )}
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

        <label htmlFor="is-hidden" className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isHidden"
            id="is-hidden"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
          />
          Hide this record
        </label>

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

        <div className={isEditing ? "flex gap-2" : ""}>
          <button
            type="submit"
            disabled={
              !canAddRecord() ||
              (isEditing && (recordsLoading || !existingRecord))
            }
            className={`${isEditing ? "flex-1" : "w-full"} bg-indigo-200 text-indigo-800 py-2 border border-indigo-700 cursor-pointer disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed`}
          >
            {isEditing ? "Save Changes" : "Add Record"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 cursor-pointer border border-slate-400 bg-white py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
        {submitError && (
          <p role="alert" className="text-red-700">
            {submitError}
          </p>
        )}
      </form>
    </main>
  );
};

export default RecordForm;
