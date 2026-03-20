import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            عبدالله رضا
          </Link>

          {/* روابط سطح المكتب */}
          <div className="hidden md:flex space-x-8 space-x-reverse">
            <Link to="/" className="text-gray-300 hover:text-white transition">الرئيسية</Link>
            <Link to="/services" className="text-gray-300 hover:text-white transition">الخدمات</Link>
            <Link to="/projects" className="text-gray-300 hover:text-white transition">المشاريع</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition">تواصل</Link>
          </div>

          {/* زر القائمة للجوال */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* القائمة المنسدلة للجوال */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <Link to="/" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>الرئيسية</Link>
            <Link to="/services" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>الخدمات</Link>
            <Link to="/projects" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>المشاريع</Link>
            <Link to="/contact" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>تواصل</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;