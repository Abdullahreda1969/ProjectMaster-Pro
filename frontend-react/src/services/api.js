import axios from 'axios';

// إنشاء instance من axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// للتصحيح
api.interceptors.request.use(request => {
  console.log('📤 طلب:', request.method, request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('📥 استجابة:', response.status);
    return response;
  },
  error => {
    console.error('❌ خطأ:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// دالة جلب إحصائيات لوحة التحكم (محسّنة)
export const getDashboardStats = async () => {
  try {
    console.log('🔍 جلب إحصائيات لوحة التحكم...');
    
    // محاولة جلب بيانات المستخدمين
    let userCount = 0;
    try {
      const usersRes = await api.get('/users/count');
      userCount = usersRes.data?.count || 0;
      console.log('✅ عدد المستخدمين:', userCount);
    } catch (e) {
      console.warn('⚠️ لا يمكن جلب عدد المستخدمين:', e.message);
    }
    
    // محاولة جلب إحصائيات المشاريع
    let projectsCount = 0;
    try {
      const projectsRes = await api.get('/projects/stats');
      projectsCount = projectsRes.data?.stats?.total || 0;
      console.log('✅ عدد المشاريع:', projectsCount);
    } catch (e) {
      console.warn('⚠️ لا يمكن جلب إحصائيات المشاريع:', e.message);
    }
    
    // محاولة جلب إحصائيات المهام
    let tasksCount = 0;
    let completedTasks = 0;
    try {
      const tasksRes = await api.get('/tasks/stats');
      tasksCount = tasksRes.data?.stats?.total || 0;
      completedTasks = tasksRes.data?.stats?.completed || 0;
      console.log('✅ عدد المهام:', tasksCount);
    } catch (e) {
      console.warn('⚠️ لا يمكن جلب إحصائيات المهام:', e.message);
    }
    
    // التحقق من صحة قاعدة البيانات عن طريق /health
    let dbConnected = true;
    try {
      const healthRes = await api.get('/health');
      dbConnected = healthRes.data?.database?.connected === true;
      console.log('✅ حالة قاعدة البيانات:', dbConnected ? 'متصلة' : 'غير متصلة');
    } catch (e) {
      console.warn('⚠️ لا يمكن جلب حالة الصحة:', e.message);
      dbConnected = false;
    }
    
    return {
      userCount,
      projectsCount,
      tasksCount,
      completedTasks,
      dbConnected // هذه القيمة ستُستخدم في لوحة التحكم
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    return {
      userCount: 0,
      projectsCount: 0,
      tasksCount: 0,
      completedTasks: 0,
      dbConnected: false
    };
  }
};

// دوال المستخدمين
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
    throw error;
  }
};

export const getUserCount = async () => {
  try {
    const response = await api.get('/users/count');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب عدد المستخدمين:', error);
    throw error;
  }
};

// دوال المشاريع
export const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب المشاريع:', error);
    throw error;
  }
};

export const getProjectStats = async () => {
  try {
    const response = await api.get('/projects/stats');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات المشاريع:', error);
    throw error;
  }
};

// دوال المهام
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب المهام:', error);
    throw error;
  }
};

export const getTaskStats = async () => {
  try {
    const response = await api.get('/tasks/stats');
    return response.data;
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات المهام:', error);
    throw error;
  }
};

// تصدير api نفسه للاستخدام المباشر
export default api;