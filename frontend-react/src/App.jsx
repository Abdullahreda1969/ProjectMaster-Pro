import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import Invoices from './pages/Invoices';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100" dir="rtl">
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: 'green',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: 'red',
              },
            },
          }}
        />
        
        <aside className="w-64 bg-white shadow-lg">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">ProjectMaster-Pro</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link to="/" className="block p-2 hover:bg-blue-50 rounded transition">
                  📊 لوحة التحكم
                </Link>
              </li>
              <li>
                <Link to="/projects" className="block p-2 hover:bg-blue-50 rounded transition">
                  📁 المشاريع
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="block p-2 hover:bg-blue-50 rounded transition">
                  ✅ المهام
                </Link>
              </li>
              <li>
                <Link to="/teams" className="block p-2 hover:bg-blue-50 rounded transition">
                  👥 الفرق
                </Link>
              </li>
              <li>
                <Link to="/invoices" className="block p-2 hover:bg-blue-50 rounded transition">
                  💰 الفواتير
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/invoices" element={<Invoices />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;