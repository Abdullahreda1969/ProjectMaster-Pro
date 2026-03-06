import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('فشل في تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
  return (
    <div className="p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
        <h2 className="font-bold text-lg mb-2">❌ خطأ في تحميل البيانات</h2>
        <p className="mb-4">{error}</p>
        <div className="bg-white p-4 rounded border border-red-300">
          <h3 className="font-bold mb-2">🔧 خطوات التشخيص:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>تأكد من أن الباك إند شغال على http://localhost:3000</li>
            <li>افتح http://localhost:3000/api/health في متصفح منفصل</li>
            <li>شوف إذا كانت قاعدة البيانات متصلة</li>
            <li>إذا كنت تستخدم PowerShell، تأكد من عدم وجود أخطاء في نافذة الباك إند</li>
          </ul>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          🔄 إعادة تحميل الصفحة
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm">عدد المستخدمين</h2>
          <p className="text-3xl font-bold">{stats?.userCount || 0}</p>
        </div>
        
       <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-500 text-sm">حالة قاعدة البيانات</h2>
        <p className={`text-xl font-bold ${stats.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
          {stats.dbConnected ? '✅ متصلة' : '❌ غير متصلة'}
        </p>
      </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm">عدد المجموعات</h2>
          <p className="text-3xl font-bold">{stats?.collections?.length || 0}</p>
        </div>
      </div>
      
      {/* قائمة المجموعات */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">المجموعات في قاعدة البيانات</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats?.collections?.map((col, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border">
              {col.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* أزرار الإجراءات السريعة */}
      <div className="mt-8 flex gap-4">
        <button 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          onClick={() => window.location.href = '/projects/new'}
        >
          + مشروع جديد
        </button>
        <button 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          onClick={() => window.location.href = '/tasks/new'}
        >
          + مهمة جديدة
        </button>
      </div>
    </div>
  );
};

export default Dashboard;