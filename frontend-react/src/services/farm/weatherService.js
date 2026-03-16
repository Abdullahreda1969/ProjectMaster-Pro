import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '15301dd11cee3b2bb4aa9004a5167bed';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// جلب الطقس الحالي
export const getCurrentWeather = async (lat, lng) => {
    try {
        console.log('🌤️ جلب الطقس الحالي:', lat, lng);
        
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: lat,
                lon: lng,
                appid: WEATHER_API_KEY,
                units: 'metric',
                lang: 'ar'
            }
        });
        
        return {
            temp: Math.round(response.data.main.temp),
            feelsLike: Math.round(response.data.main.feels_like),
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            windSpeed: response.data.wind.speed,
            condition: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        };
    } catch (error) {
        console.error('❌ خطأ في جلب الطقس الحالي:', error);
        return {
            temp: 22,
            humidity: 45,
            windSpeed: 12,
            condition: 'غائم جزئي'
        };
    }
};

// جلب توقعات 5 أيام
export const getWeatherForecast = async (lat, lng) => {
    try {
        console.log('📅 جلب توقعات 5 أيام:', lat, lng);
        
        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                lat: lat,
                lon: lng,
                appid: WEATHER_API_KEY,
                units: 'metric',
                lang: 'ar',
                cnt: 40 // نطلب عدد كافي من التوقعات
            }
        });
        
        // تجميع التوقعات حسب اليوم
        const dailyForecast = [];
        const seenDates = new Set();
        
        response.data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString(); // "Sat Mar 14 2026"
            
            // إذا لم نر هذا التاريخ من قبل، نضيفه
            if (!seenDates.has(dateKey)) {
                seenDates.add(dateKey);
                
                dailyForecast.push({
                    date: date,
                    temp: Math.round(item.main.temp),
                    condition: item.weather[0].description,
                    icon: item.weather[0].icon
                });
            }
        });
        
        // نأخذ أول 5 أيام فقط
        const result = dailyForecast.slice(0, 5);
        
        console.log('✅ التوقعات اليومية:', result.map(d => ({
            تاريخ: d.date.toLocaleDateString('ar-EG'),
            يوم: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d.date.getDay()],
            درجة: d.temp
        })));
        
        return result;
    } catch (error) {
        console.error('❌ خطأ في جلب التوقعات:', error);
        return [];
    }
};