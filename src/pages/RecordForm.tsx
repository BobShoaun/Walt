import { useNavigate, useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
          <div className="relative mt-1">
            <input
              type="number"
              name="amount"
              id="amount"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.valueAsNumber)}
              className="number-input-no-spinner block h-16 w-full rounded-md border border-slate-300 bg-white pl-4 pr-10 text-right text-3xl font-semibold tabular-nums text-slate-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100"
            />
            <div className="absolute inset-y-2 right-2 flex w-7 flex-col overflow-hidden rounded border border-slate-200 bg-white">
              <button
                type="button"
                aria-label="Increase amount by one"
                onClick={() =>
                  setAmount((current) =>
                    Math.max(0, Number(((Number.isFinite(current) ? current : 0) + 1).toFixed(2))),
                  )
                }
                className="flex flex-1 cursor-pointer items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700"
              >
                <ChevronUp aria-hidden="true" size={14} />
              </button>
              <button
                type="button"
                aria-label="Decrease amount by one"
                onClick={() =>
                  setAmount((current) =>
                    Math.max(0, Number(((Number.isFinite(current) ? current : 0) - 1).toFixed(2))),
                  )
                }
                className="flex flex-1 cursor-pointer items-center justify-center border-t border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700"
              >
                <ChevronDown aria-hidden="true" size={14} />
              </button>
            </div>
          </div>
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
            className="block w-full border border-gray-300 px-3 py-2 mt-1 shadow-inner cursor-pointer disabled:cursor-pointer"
          >
            <option value="" disabled className="cursor-pointer">
              {categoriesLoading ? "Loading categories..." : "Select a category"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="cursor-pointer">
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

        <label htmlFor="is-hidden" className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="isHidden"
            id="is-hidden"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="cursor-pointer"
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
            className="block w-full border border-gray-300 px-3 py-2 cursor-pointer disabled:cursor-pointer mt-1 shadow-inner"
          >
            <option value="" disabled className="cursor-pointer">
              {paymentMethodsLoading ? "Loading payment methods..." : "Select a payment method"}
            </option>
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.id} value={paymentMethod.id} className="cursor-pointer">
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
            className={`${isEditing ? "flex-1" : "w-full"} cursor-pointer rounded-md border border-emerald-700 bg-emerald-700 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400`}
          >
            {isEditing ? "Save Changes" : "Add Record"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
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
