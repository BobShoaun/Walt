import { useState } from "react";
import { dummyExpenses } from "../Expense";
import { Link } from "react-router-dom";

import ExpenseCard from "../components/ExpenseCard";

const Dashboard = () => {
  const [count, setCount] = useState(0);

  const expenses = [...dummyExpenses, ...dummyExpenses, ...dummyExpenses];

  return (
    <main className="flex flex-col overflow-auto relative">
      {/* <h1 className="text-3xl font-bold underline">Expense Tracker</h1> */}

      <div className="m-2">
        <input
          type="search"
          placeholder="Search"
          className="border-2 border-gray-500 px-2 w-full"
        />
      </div>

      <div className="bg-gray-200 m-3 rounded-lg shrink overflow-auto shadow-sm border-collapse">
        {expenses.map((expense) => (
          <ExpenseCard expense={expense} />
        ))}
      </div>

      {/* <div>
        <Link className='p-5 cursor-pointer block bg-red-500' to='/add'>+ Add Expense</Link>
      </div> */}

      <Link
        className="absolute p-4 cursor-pointer block bg-blue-500 text-white font-bold text-xl shadow-2xl bottom-2 right-2 rounded-4xl"
        to="/add"
      >
        +
      </Link>
    </main>
  );
};

export default Dashboard;
