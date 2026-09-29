import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import AddRecord from './pages/AddRecord.tsx';
import { AppDataProvider } from './AppDataContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddRecord />} />
          {/* <Route path="/settings" element={<Settings />} /> */}
        </Routes>

        <nav className="flex gap-4 p-4 bg-slate-800 text-white">
          <Link to="/">Dashboard</Link>
          <Link to="/add">Add Record</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </Router>
    </AppDataProvider>
  </StrictMode>,
)
