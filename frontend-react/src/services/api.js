import axios from 'axios';

// المهم هنا: baseURL = '/api' وليس الرابط الكامل
const api = axios.create({
  baseURL: '/api',  // هذا هو المفتاح السحري!
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false  // مهم لـ CORS
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

export default api;

// دوال الإحصائيات (يمكنك نسخها من ملفك الحالي)
export const getDashboardStats = async () => {
  try {
    console.log('🔍 جلب إحصائيات لوحة التحكم...');
    
    const [usersRes, projectsRes, tasksRes] = await Promise.all([
      api.get('/users/count').catch(() => ({ data: { count: 0 } })),
      api.get('/projects/stats').catch(() => ({ data: { stats: { total: 0 } } })),
      api.get('/tasks/stats').catch(() => ({ data: { stats: { total: 0, completed: 0 } } }))
    ]);
    
    return {
      userCount: usersRes.data?.count || 0,
      projectsCount: projectsRes.data?.stats?.total || 0,
      tasksCount: tasksRes.data?.stats?.total || 0,
      completedTasks: tasksRes.data?.stats?.completed || 0,
      dbConnected: true
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