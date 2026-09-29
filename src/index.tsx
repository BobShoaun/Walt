import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { LayoutDashboard, List, Plus } from "lucide-react";

import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import RecordList from './pages/RecordList.tsx'
import RecordInsights from './pages/RecordInsights.tsx'
import RecordForm from './pages/RecordForm.tsx';
import { AppDataProvider } from './AppDataContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/records" element={<RecordList />} />
          <Route path="/insights" element={<RecordInsights />} />
          <Route path="/records/add" element={<RecordForm />} />
          <Route path="/records/:recordId/edit" element={<RecordForm />} />
          {/* <Route path="/settings" element={<Settings />} /> */}
        </Routes>

        <nav
          aria-label="Main navigation"
          className="z-10 shrink-0 border-t border-slate-200 bg-white px-3 pt-2 shadow-[0_-4px_16px_rgba(15,23,42,0.04)]"
        >
          <div className="mx-auto grid min-h-14 w-full max-w-xl grid-cols-3 gap-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `relative flex cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-700 ${isActive ? "bg-emerald-50 text-emerald-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard aria-hidden="true" size={18} strokeWidth={2} />
                Dashboard
              </span>
            </NavLink>
            <NavLink
              to="/records"
              end
              className={({ isActive }) =>
                `relative flex cursor-pointer items-center justify-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-700 ${isActive ? "bg-emerald-50 text-emerald-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <List aria-hidden="true" size={18} strokeWidth={2} />
                Records
              </span>
            </NavLink>
            <NavLink
              to="/records/add"
              end
              className={({ isActive }) =>
                `flex cursor-pointer items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-700 ${isActive ? "bg-emerald-700 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus aria-hidden="true" size={18} strokeWidth={2.5} />
                Add Record
              </span>
            </NavLink>
          </div>
        </nav>
      </Router>
    </AppDataProvider>
  </StrictMode>,
)
