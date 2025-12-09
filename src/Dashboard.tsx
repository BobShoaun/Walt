import { useState } from 'react'
import './App.css'
import { dummyExpenses } from './Expense';
import { categories } from './Category';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [count, setCount] = useState(0);

  const expenses = [...dummyExpenses, ...dummyExpenses, ...dummyExpenses]


  return (
    <main className='flex flex-col overflow-auto relative'>
      {/* <h1 className="text-3xl font-bold underline">Expense Tracker</h1> */}

      <div className='m-2'>
        <input type="search" placeholder='Search' className='border-2 border-gray-500 px-2 w-full' />
      </div>

      <div className="bg-gray-200 m-3 rounded-lg shrink overflow-auto shadow-sm border-collapse">

        {expenses.map(expense => (
          <div className='flex gap-2 py-1 px-3 border-2 border-collapse border-gray-300'>

            <div className='text-2xl my-auto bg-green-200 rounded-full p-1 shadow-sm'>
              <p>{categories.find(category => category.slug === expense.category)?.image}</p>
            </div>

            <div>
              <h2 className='text-gray-500 text-base'>{expense.description}</h2>
              <p className='text-gray-800 text-xs'>{expense.category}</p>
            </div>

            <div className='ml-auto text-right'>
              <p className='text-red-700'>-{expense.amount}
                <span className='ml-1 text-xs'>{expense.currency}</span>

              </p>
              <time className='text-xs'>{new Date(expense.timestamp).toLocaleTimeString()}</time>
            </div>
          </div>
        ))}


      </div>

      {/* <div>
        <Link className='p-5 cursor-pointer block bg-red-500' to='/add'>+ Add Expense</Link>
      </div> */}

      <Link className='absolute p-4 cursor-pointer block bg-blue-500 text-white font-bold text-xl shadow-2xl bottom-2 right-2 rounded-4xl' to='/add'>+</Link>
    </main>
  )
}

export default Dashboard;
