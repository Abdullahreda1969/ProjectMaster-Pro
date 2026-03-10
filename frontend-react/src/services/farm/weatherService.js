import axios from 'axios';

// استخدم مفتاح API من متغيرات البيئة
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // اقرأ المفتاح من .env
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// جلب الطقس الحالي لموقع معين
export const getCurrentWeather = async (lat, lng) => {
    try {
        console.log('🔍 API Key from env:', WEATHER_API_KEY); // للتصحيح
        
        const response = await axios.get(`${WEATHER_API_URL}/weather`, {
            params: {
                lat: lat,
                lon: lng,
                appid: WEATHER_API_KEY,
                units: 'metric',
                lang: 'ar'
            }
        });
        
        return {
            temp: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            windSpeed: response.data.wind.speed,
            windDeg: response.data.wind.deg,
            condition: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            clouds: response.data.clouds.all
        };
    } catch (error) {
        console.error('❌ خطأ في جلب الطقس:', error);
        // بيانات تجريبية في حالة فشل الاتصال
        return {
            temp: 22,
            feelsLike: 21,
            humidity: 45,
            windSpeed: 12,
            condition: 'غائم جزئي',
            icon: '03d'
        };
    }
};

// جلب توقعات 5 أيام
export const getWeatherForecast = async (lat, lng) => {
    try {
        const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
            params: {
                lat: lat,
                lon: lng,
                appid: WEATHER_API_KEY,
                units: 'metric',
                lang: 'ar',
                cnt: 5
            }
        });
        
        return response.data.list.map(item => ({
            date: new Date(item.dt * 1000),
            temp: item.main.temp,
            humidity: item.main.humidity,
            condition: item.weather[0].description,
            icon: item.weather[0].icon
        }));
    } catch (error) {
        console.error('❌ خطأ في جلب التوقعات:', error);
        return [];
    }
};