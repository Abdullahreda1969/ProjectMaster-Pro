import api from '../api';

const API_URL = 'http://localhost:3000/api';

// جلب جميع المزارع
export const getFarms = async () => {
    try {
        const response = await api.get(`${API_URL}/farms`);
        return response.data.farms;
    } catch (error) {
        console.error('❌ خطأ في جلب المزارع:', error);
        return [];
    }
};

// جلب مزرعة محددة
export const getFarmById = async (id) => {
    try {
        const response = await api.get(`${API_URL}/farms/${id}`);
        return response.data.farm;
    } catch (error) {
        console.error('❌ خطأ في جلب المزرعة:', error);
        return null;
    }
};

// إضافة مزرعة جديدة
export const addFarm = async (farmData) => {
    try {
        const response = await api.post(`${API_URL}/farms`, farmData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إضافة المزرعة:', error);
        throw error;
    }
};

// تحديث مزرعة
export const updateFarm = async (id, farmData) => {
    try {
        const response = await api.put(`${API_URL}/farms/${id}`, farmData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في تحديث المزرعة:', error);
        throw error;
    }
};

// حذف مزرعة
export const deleteFarm = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/farms/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في حذف المزرعة:', error);
        throw error;
    }
};
export const getNdviReadings = async (farmId) => {
    try {
        const response = await api.get(`${API_URL}/farms/${farmId}/ndvi`);
        return response.data.readings;
    } catch (error) {
        console.error('❌ خطأ في جلب قراءات NDVI:', error);
        return [];
    }
};

// إضافة قراءة NDVI
export const addNdviReading = async (farmId, readingData) => {
    try {
        const response = await api.post(`${API_URL}/farms/${farmId}/ndvi`, readingData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إضافة قراءة NDVI:', error);
        throw error;
    }
};

// جلب سجلات الطقس
export const getWeatherRecords = async (farmId) => {
    try {
        const response = await api.get(`${API_URL}/farms/${farmId}/weather`);
        return response.data.records;
    } catch (error) {
        console.error('❌ خطأ في جلب سجلات الطقس:', error);
        return [];
    }
};