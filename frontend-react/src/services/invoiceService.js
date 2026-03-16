import api from './api';

// جلب جميع الفواتير
export const getInvoices = async () => {
    try {
        const response = await api.get('/invoices');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في جلب الفواتير:', error);
        throw error;
    }
};

// جلب فاتورة واحدة
export const getInvoiceById = async (id) => {
    try {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في جلب الفاتورة:', error);
        throw error;
    }
};

// إنشاء فاتورة جديدة
export const createInvoice = async (invoiceData) => {
    try {
        console.log('📤 إرسال بيانات الفاتورة:', invoiceData);
        const response = await api.post('/invoices', invoiceData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إنشاء الفاتورة:', error);
        throw error;
    }
};

// تحديث فاتورة
export const updateInvoice = async (id, invoiceData) => {
    try {
        const response = await api.put(`/invoices/${id}`, invoiceData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في تحديث الفاتورة:', error);
        throw error;
    }
};

// حذف فاتورة
export const deleteInvoice = async (id) => {
    try {
        const response = await api.delete(`/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في حذف الفاتورة:', error);
        throw error;
    }
};

// جلب إحصائيات الفواتير
export const getInvoiceStats = async () => {
    try {
        const response = await api.get('/invoices/stats');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في جلب إحصائيات الفواتير:', error);
        throw error;
    }
};

// تحديث حالة الفاتورة
export const updateInvoiceStatus = async (id, status) => {
    try {
        const response = await api.patch(`/invoices/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في تحديث حالة الفاتورة:', error);
        throw error;
    }
};