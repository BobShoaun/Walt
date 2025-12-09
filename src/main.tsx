import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './index.css'
import Dashboard from './Dashboard.tsx'
import AddExpense from './AddExpense.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        {/* <Route path="/settings" element={<Settings />} /> */}
      </Routes>

      <nav className="flex gap-4 p-4 bg-slate-800 text-white">
        <Link to="/">Dashboard</Link>
        <Link to="/add">Add Expense</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </Router>
  </StrictMode>,
)
