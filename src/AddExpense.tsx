import { categories } from "./Category";
import { paymentMethods } from "./PaymentMethod";

const AddExpense = () => {

  return (
    <main className="p-2 h-full">

      <form action="" onSubmit={e => { e.preventDefault() }} className="flex flex-col gap-4">


        <div className="">
          <label htmlFor="amount">Amount</label>
          <input type="number" name="amount" id="amount" className="block border border-gray-300 shadow-inner w-full px-3 py-2 mt-1" />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select name="category" className="block w-full border border-gray-300 px-3 py-2 mt-1 shadow-inner cursor-pointer">
            {categories.map(category => (
              <option key={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea name="description" id="description" className="mt-1 block border border-gray-300 shadow-inner w-full resize-none h-20 px-3 py-2" />
        </div>

        <div>
          <label htmlFor="payment-method">Payment Method</label>
          <select name="payment-method" className="block w-full border border-gray-300 px-3 py-2 cursor-pointer mt-1 shadow-inner">
            {paymentMethods.map(paymentMethod => (
              <option key={paymentMethod.slug}>{paymentMethod.name}</option>
            ))}
          </select>
        </div>


        <div>
          <label htmlFor="timestamp">Date & Time</label>
          <input type="datetime-local" name="timestamp" id="timestamp" className="mt-1 w-full block border border-gray-300 shadow-inner px-3 py-2" />
        </div>

        <button type="submit" className="w-full bg-indigo-200 text-indigo-800 py-2 border border-indigo-700 cursor-pointer">Add Expense</button>

      </form>
    </main>
  );
}

export default AddExpense;