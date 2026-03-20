import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* معلومات التواصل */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">عبدالله رضا</h3>
            <p className="text-gray-400 mb-2">مطور برمجيات متكامل</p>
            <p className="text-gray-400">بناء أنظمة إدارة متكاملة وتطبيقات ويب</p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-blue-400 transition">الرئيسية</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-blue-400 transition">الخدمات</Link></li>
              <li><Link to="/projects" className="text-gray-400 hover:text-blue-400 transition">المشاريع</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-blue-400 transition">تواصل معي</Link></li>
            </ul>
          </div>

          {/* وسائل التواصل */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">تواصل معي</h3>
            <div className="flex space-x-4 space-x-reverse">
              <a href="https://github.com/Abdullahreda1969" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <span className="text-2xl">🐙</span>
              </a>
              <a href="https://linkedin.com/in/abdullahreda" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <span className="text-2xl">🔗</span>
              </a>
              <a href="mailto:your.email@example.com" className="text-gray-400 hover:text-white transition">
                <span className="text-2xl">📧</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2026 عبدالله رضا - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;