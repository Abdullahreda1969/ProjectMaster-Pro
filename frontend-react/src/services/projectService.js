import api from 'api';

// جلب جميع المشاريع
export const getProjects = async () => {
    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في جلب المشاريع:', error);
        throw error;
    }
};

// إنشاء مشروع جديد (مبسط)
export const createProject = async (projectData) => {
    try {
        console.log('📤 إرسال بيانات المشروع:', projectData);
        
        // التأكد من إرسال البيانات بشكل صحيح
        const response = await api.post('/projects', projectData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📥 استجابة السيرفر:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إنشاء المشروع:', error);
        console.error('❌ تفاصيل الخطأ:', error.response?.data || error.message);
        throw error;
    }
};

// تحديث مشروع
export const updateProject = async (id, projectData) => {
    try {
        const response = await api.put(`/projects/${id}`, projectData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في تحديث المشروع:', error);
        throw error;
    }
};

// حذف مشروع
export const deleteProject = async (id) => {
    try {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في حذف المشروع:', error);
        throw error;
    }
};