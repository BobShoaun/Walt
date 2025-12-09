import { categories } from "../Category";
import type { Expense } from "../Expense";

const ExpenseCard = ({ expense }: { expense: Expense }) => {
  const category = categories.find(
    (category) => category.slug === expense.category
  );

  return (
    <div className="flex gap-2 py-1 px-3 border-2 border-collapse border-gray-300">
      <div className="text-2xl my-auto bg-white rounded-full p-1 shadow-sm select-none">
        <p>{category?.image}</p>
      </div>

      <div>
        <h2 className="text-gray-500 text-base">{expense.description}</h2>
        <p className="text-gray-800 text-xs">{category?.name}</p>
      </div>

      <div className="ml-auto text-right">
        <p className="text-red-700">
          -{expense.amount}
          <span className="ml-1 text-xs">{expense.currency}</span>
        </p>
        <time className="text-xs">
          {new Date(expense.timestamp).toLocaleTimeString()}
        </time>
      </div>
    </div>
  );
};

export default ExpenseCard;
