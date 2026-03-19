import api from 'api';

// جلب جميع المهام
export const getTasks = async () => {
    try {
        const response = await api.get('/tasks');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في جلب المهام:', error);
        throw error;
    }
};

// إنشاء مهمة جديدة
export const createTask = async (taskData) => {
    try {
        // التأكد من وجود العنوان
        if (!taskData.title) {
            throw new Error('عنوان المهمة مطلوب');
        }
        
        // تنظيف البيانات من الحقول الفارغة
        const cleanData = {
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'pending',
            priority: taskData.priority || 'medium',
            projectId: taskData.projectId || null,
            projectName: taskData.projectName || '',
            assignee: taskData.assignee || '',
            dueDate: taskData.dueDate || null,
            estimatedHours: taskData.estimatedHours ? Number(taskData.estimatedHours) : 0
        };
        
        console.log('📤 إرسال بيانات المهمة:', cleanData);
        
        const response = await api.post('/tasks', cleanData);
        
        console.log('📥 استجابة:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إنشاء المهمة:', error);
        console.error('❌ تفاصيل:', error.response?.data || error.message);
        throw error;
    }
};
// تحديث مهمة
export const updateTask = async (id, taskData) => {
    try {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في تحديث المهمة:', error);
        throw error;
    }
};

// حذف مهمة
export const deleteTask = async (id) => {
    try {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في حذف المهمة:', error);
        throw error;
    }
};

// جلب إحصائيات المهام
export const getTaskStats = async () => {
    try {
        const response = await api.get('/tasks/stats');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في جلب إحصائيات المهام:', error);
        throw error;
    }
};