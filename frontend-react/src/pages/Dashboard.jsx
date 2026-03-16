import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { getFarms } from '../services/farm/farmService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    projectsCount: 0,
    tasksCount: 0,
    completedTasks: 0,
    dbConnected: false
  });
  const [loading, setLoading] = useState(true);
  const [farmStats, setFarmStats] = useState({ total: 0, healthy: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
      const loadFarmStats = async () => {
          try {
              const farms = await getFarms();
              const healthy = farms.filter(f => f.ndvi > 0.7).length;
              setFarmStats({ total: farms.length, healthy });
          } catch (error) {
              console.error('Error loading farm stats:', error);
          }
      };
      loadFarmStats();
  }, []);


  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">نظرة عامة على المشاريع والمهام</p>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* المستخدمين */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">المستخدمين</p>
              <p className="text-3xl font-bold text-gray-800">{stats.userCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <Link to="/teams" className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block">
            عرض جميع الفرق →
          </Link>
        </div>

        {/* المشاريع */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">المشاريع</p>
              <p className="text-3xl font-bold text-gray-800">{stats.projectsCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📁</span>
            </div>
          </div>
          <Link to="/projects" className="text-sm text-green-600 hover:text-green-800 mt-3 inline-block">
            عرض جميع المشاريع →
          </Link>
        </div>

        {/* المهام */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">المهام</p>
              <p className="text-3xl font-bold text-gray-800">{stats.tasksCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <Link to="/tasks" className="text-sm text-purple-600 hover:text-purple-800 mt-3 inline-block">
            عرض جميع المهام →
          </Link>
        </div>

        {/* المهام المكتملة */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-r-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">مهام مكتملة</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completedTasks}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: stats.tasksCount ? `${(stats.completedTasks / stats.tasksCount) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        // ثم أضف هذه البطاقة في قسم الإحصائيات
        <div className="bg-white rounded-lg shadow p-6 border-r-4 border-emerald-500">
          <div className="flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-sm">مزارع البطاطا</p>
                  <p className="text-3xl font-bold text-gray-800">{farmStats.total}</p>
                  <p className="text-sm text-emerald-600">{farmStats.healthy} بصحة ممتازة</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                  <span className="text-2xl">🌾</span>
              </div>
          </div>
          <Link to="/farm" className="text-sm text-emerald-600 hover:text-emerald-800 mt-3 inline-block">
              عرض الخريطة ←
          </Link>
        </div>
      </div>

      {/* أزرار الإجراءات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link 
              to="/projects" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 hover:shadow-lg transition flex items-center justify-between"
          >
              <span className="text-lg font-semibold">➕ مشروع جديد</span>
              <span className="text-3xl">📁</span>
          </Link>
          
          <Link 
              to="/tasks" 
              className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 hover:shadow-lg transition flex items-center justify-between"
          >
              <span className="text-lg font-semibold">➕ مهمة جديدة</span>
              <span className="text-3xl">✅</span>
          </Link>
          
          <Link 
              to="/teams" 
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-4 hover:shadow-lg transition flex items-center justify-between"
          >
              <span className="text-lg font-semibold">➕ فريق جديد</span>
              <span className="text-3xl">👥</span>
          </Link>

          {/* الرابط الجديد للمشروع الزراعي */}
          <Link 
              to="/farm" 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg p-4 hover:shadow-lg transition flex items-center justify-between"
          >
              <span className="text-lg font-semibold">🗺️ خريطة المزارع</span>
              <span className="text-3xl">🌾</span>
          </Link>
      </div>

      {/* حالة قاعدة البيانات */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">حالة النظام</h2>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.dbConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-700">قاعدة البيانات</span>
          </div>
          <span className={`font-semibold ${stats.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
            {stats.dbConnected ? '✅ متصلة' : '❌ غير متصلة'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;