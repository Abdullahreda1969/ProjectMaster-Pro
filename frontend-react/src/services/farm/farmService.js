import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// جلب جميع المزارع
export const getFarms = async () => {
    try {
        const response = await axios.get(`${API_URL}/farms`);
        console.log('Data from backend:', response.data);
        
        // إذا كانت قاعدة البيانات تحتوي على مزارع، أرجعها
        if (response.data.farms && response.data.farms.length > 0) {
            return response.data.farms;
        } 
        
        // إذا كانت قاعدة البيانات فارغة، استخدم البيانات التجريبية
        console.log('⚠️ قاعدة البيانات فارغة، استخدام بيانات تجريبية');
        return [
            { 
                id: 1, 
                name: 'مزرعة الفرات', 
                location: { lat: 33.3152, lng: 44.3661 }, 
                area: 50, 
                cropType: 'بطاطا سبونتا',
                plantingDate: '2025-01-15',
                ndvi: 0.75,
                status: 'active'
            },
            { 
                id: 2, 
                name: 'مزرعة دجلة', 
                location: { lat: 33.5152, lng: 44.5661 }, 
                area: 120, 
                cropType: 'بطاطا دراجا',
                plantingDate: '2025-02-01',
                ndvi: 0.68,
                status: 'active'
            },
            { 
                id: 3, 
                name: 'مزرعة بابل', 
                location: { lat: 32.5152, lng: 44.4661 }, 
                area: 200, 
                cropType: 'بطاطا سبونتا',
                plantingDate: '2025-01-10',
                ndvi: 0.82,
                status: 'active'
            }
        ];
    } catch (error) {
        console.error('❌ خطأ في جلب المزارع:', error);
        return [];
    }
};

// جلب مزرعة محددة
export const getFarmById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/farms/${id}`);
        return response.data.farm;
    } catch (error) {
        console.error('❌ خطأ في جلب المزرعة:', error);
        return null;
    }
};

// إضافة مزرعة جديدة
export const addFarm = async (farmData) => {
    try {
        const response = await axios.post(`${API_URL}/farms`, farmData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إضافة المزرعة:', error);
        throw error;
    }
};

// تحديث مزرعة
export const updateFarm = async (id, farmData) => {
    try {
        const response = await axios.put(`${API_URL}/farms/${id}`, farmData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في تحديث المزرعة:', error);
        throw error;
    }
};

// حذف مزرعة
export const deleteFarm = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/farms/${id}`);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في حذف المزرعة:', error);
        throw error;
    }
};

// جلب قراءات NDVI
export const getNdviReadings = async (farmId) => {
    try {
        const response = await axios.get(`${API_URL}/farms/${farmId}/ndvi`);
        return response.data.readings;
    } catch (error) {
        console.error('❌ خطأ في جلب قراءات NDVI:', error);
        return [];
    }
};

// إضافة قراءة NDVI
export const addNdviReading = async (farmId, readingData) => {
    try {
        const response = await axios.post(`${API_URL}/farms/${farmId}/ndvi`, readingData);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إضافة قراءة NDVI:', error);
        throw error;
    }
};

// جلب سجلات الطقس
export const getWeatherRecords = async (farmId) => {
    try {
        const response = await axios.get(`${API_URL}/farms/${farmId}/weather`);
        return response.data.records;
    } catch (error) {
        console.error('❌ خطأ في جلب سجلات الطقس:', error);
        return [];
    }
};