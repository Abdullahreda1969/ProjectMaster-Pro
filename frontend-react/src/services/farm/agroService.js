import axios from 'axios';

const AGRO_API_URL = 'http://api.agromonitoring.com/agro/1.0';
const API_KEY = import.meta.env.VITE_AGRO_API_KEY || '42b5fa993adeea48e78b0c5d7afb05b5';

export const getLatestNDVI = async (polygonId) => {
    try {
        const now = Math.floor(Date.now() / 1000) - 300;
        const start = now - (180 * 24 * 60 * 60); // 6 أشهر

        const response = await axios.get(
            `${AGRO_API_URL}/image/search`,
            {
                params: {
                    start: start,
                    end: now,
                    polyid: polygonId,
                    appid: API_KEY
                }
            }
        );
        
        if (response.data.length === 0) {
            console.log('⚠️ لا توجد صور NDVI متاحة');
            return null;
        }

        // اختيار الصور ذات الغيوم المنخفضة
        const validImages = response.data.filter(img => img.cl < 40);
        
        if (validImages.length === 0) {
            console.log('⚠️ جميع الصور بها غيوم كثيفة، سيتم استخدام أفضل صورة متاحة');
            const bestImage = response.data.reduce((best, current) => 
                (current.cl < best.cl) ? current : best
            );
            
            return {
                date: new Date(bestImage.dt * 1000),
                source: bestImage.type === 'l8' ? 'Landsat-8' : 'Sentinel-2',
                cloudCover: bestImage.cl,
                ndvi: bestImage.data?.mean || 0,
                min: bestImage.data?.min || 0,
                max: bestImage.data?.max || 0,
                stats: bestImage.data || {}
            };
        }

        // اختيار أفضل صورة من الصور المقبولة
        const bestImage = validImages.reduce((best, current) => 
            (current.cl < best.cl) ? current : best
        );
        
        return {
            date: new Date(bestImage.dt * 1000),
            source: bestImage.type === 'l8' ? 'Landsat-8' : 'Sentinel-2',
            cloudCover: bestImage.cl,
            ndvi: bestImage.data?.mean || 0,
            min: bestImage.data?.min || 0,
            max: bestImage.data?.max || 0,
            stats: bestImage.data || {}
        };
    } catch (error) {
        console.error('❌ خطأ في جلب NDVI:', error.response?.data || error.message);
        return null;
    }
};

export const getNDVIHistory = async (polygonId, months = 3) => {
    try {
        const now = Math.floor(Date.now() / 1000) - 300;
        const start = now - (months * 30 * 24 * 60 * 60);

        const response = await axios.get(
            `${AGRO_API_URL}/image/search`,
            {
                params: {
                    start: start,
                    end: now,
                    polyid: polygonId,
                    appid: API_KEY
                }
            }
        );

        // تصفية الصور ذات الغيوم المقبولة (< 40%)
        const validImages = response.data.filter(img => img.cl < 40);
        
        return validImages.map(img => ({
            date: new Date(img.dt * 1000),
            value: img.data?.mean || 0,
            source: img.type === 'l8' ? 'Landsat-8' : img.type === 's2' ? 'Sentinel-2' : img.type,
            cloudCover: img.cl
        }));
    } catch (error) {
        console.error('❌ خطأ في جلب تاريخ NDVI:', error.response?.data || error.message);
        return [];
    }
};
export const createFarmPolygon = async (lat, lng, farmName = 'farm') => {
    try {
        const delta = 0.01;
        const polygonData = {
            name: `${farmName}_${lat}_${lng}`,
            geo_json: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [lng - delta, lat - delta],
                        [lng + delta, lat - delta],
                        [lng + delta, lat + delta],
                        [lng - delta, lat + delta],
                        [lng - delta, lat - delta]
                    ]]
                }
            }
        };

        console.log('📡 إنشاء polygon جديد للإحداثيات:', { lat, lng });
        
        // إضافة معامل duplicated=true للسماح بالتكرار
        const response = await axios.post(
            `${AGRO_API_URL}/polygons?appid=${API_KEY}&duplicated=true`,
            polygonData,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ Polygon created:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إنشاء polygon:', error.response?.data || error.message);
        return null;
    }
};