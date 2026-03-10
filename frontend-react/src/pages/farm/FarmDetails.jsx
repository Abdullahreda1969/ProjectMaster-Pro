import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFarmById } from '../../services/farm/farmService';
import { getCurrentWeather, getWeatherForecast } from '../../services/farm/weatherService';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// دالة محلية لتنسيق التاريخ (بدون مكتبات)
const formatDateLocal = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
        return dateString;
    }
};

// يمكنك حذف formatDateTimeFNS إذا لم تعد بحاجة لها

const FarmDetails = () => {
    const { id } = useParams();
    const [farm, setFarm] = useState(null);
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadFarmData();
    }, [id]);

    const loadFarmData = async () => {
        try {
            setLoading(true);
            
            // جلب بيانات المزرعة
            const farmData = await getFarmById(id);
            setFarm(farmData);
            
            if (farmData) {
                // جلب بيانات الطقس
                const weatherData = await getCurrentWeather(farmData.location.lat, farmData.location.lng);
                setWeather(weatherData);
                
                const forecastData = await getWeatherForecast(farmData.location.lat, farmData.location.lng);
                setForecast(forecastData);
            }
        } catch (error) {
            console.error('Error loading farm data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (ndvi) => {
        if (ndvi > 0.7) return 'bg-green-600';
        if (ndvi > 0.5) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const getStatusText = (ndvi) => {
        if (ndvi > 0.7) return 'ممتاز';
        if (ndvi > 0.5) return 'جيد';
        return 'تحت الرعاية';
    };

    // بيانات الرسم البياني NDVI (تجريبية)
    const ndviChartData = {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
            {
                label: 'مؤشر NDVI',
                data: [0.45, 0.52, 0.61, 0.68, 0.72, 0.75],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'المعدل المثالي',
                data: [0.5, 0.6, 0.7, 0.8, 0.8, 0.8],
                borderColor: 'rgba(156, 163, 175, 0.5)',
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                pointRadius: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                rtl: true,
                labels: { usePointStyle: true }
            },
            tooltip: { rtl: true }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                title: { display: true, text: 'NDVI' }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600">المزرعة غير موجودة</h2>
            </div>
        );
    }

    return (
        <div className="p-6" dir="rtl">
            {/* رأس الصفحة */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{farm.name}</h1>
                        <p className="text-gray-600 mt-1">تفاصيل وتحليلات المزرعة</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-white ${getStatusColor(farm.ndvi)}`}>
                        {getStatusText(farm.ndvi)}
                    </div>
                </div>
            </div>

            {/* تبويبات التنقل */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    className={`px-4 py-2 font-medium transition ${activeTab === 'overview' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 نظرة عامة
                </button>
                <button
                    className={`px-4 py-2 font-medium transition ${activeTab === 'weather' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('weather')}
                >
                    🌤️ الطقس
                </button>
                <button
                    className={`px-4 py-2 font-medium transition ${activeTab === 'analytics' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📈 التحليلات
                </button>
                <button
                    className={`px-4 py-2 font-medium transition ${activeTab === 'recommendations' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('recommendations')}
                >
                    💡 التوصيات
                </button>
            </div>

            {/* محتوى التبويبات */}
            <div className="min-h-[500px]">
                {/* نظرة عامة */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* بطاقات المعلومات */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-3xl mb-2">📏</div>
                                <h3 className="text-gray-500 text-sm">المساحة</h3>
                                <p className="text-2xl font-bold">{farm.area} دونم</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-3xl mb-2">🌾</div>
                                <h3 className="text-gray-500 text-sm">نوع المحصول</h3>
                                <p className="text-2xl font-bold">{farm.cropType}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-3xl mb-2">📅</div>
                                <h3 className="text-gray-500 text-sm">تاريخ الزراعة</h3>
                                <p className="text-2xl font-bold">{formatDateLocal(farm.plantingDate)}</p>
                            </div>
                        </div>

                        {/* مؤشر NDVI الحالي */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">🌱 مؤشر صحة النبات (NDVI)</h2>
                            <div className="flex items-center gap-6">
                                <div className="text-6xl font-bold text-green-600">
                                    {(farm.ndvi * 100).toFixed(0)}%
                                </div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-6">
                                        <div 
                                            className={`h-6 rounded-full ${getStatusColor(farm.ndvi)}`}
                                            style={{ width: `${farm.ndvi * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-gray-600">
                                        {farm.ndvi > 0.7 
                                            ? 'المحصول في حالة ممتازة - استمر في الرعاية'
                                            : farm.ndvi > 0.5
                                            ? 'المحصول في حالة جيدة - يوصى بالمراقبة المنتظمة'
                                            : 'المحصول يحتاج إلى رعاية فورية - يوصى بالري والتسميد'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* الطقس */}
                {activeTab === 'weather' && weather && (
                    <div className="space-y-6">
                        {/* الطقس الحالي */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">🌤️ الطقس الحالي</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🌡️</div>
                                    <div className="text-2xl font-bold">{weather.temp}°C</div>
                                    <div className="text-gray-500">درجة الحرارة</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">💧</div>
                                    <div className="text-2xl font-bold">{weather.humidity}%</div>
                                    <div className="text-gray-500">الرطوبة</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">💨</div>
                                    <div className="text-2xl font-bold">{weather.windSpeed} كم/س</div>
                                    <div className="text-gray-500">سرعة الرياح</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">☁️</div>
                                    <div className="text-2xl font-bold">{weather.condition}</div>
                                    <div className="text-gray-500">الحالة</div>
                                </div>
                            </div>
                        </div>

                        {/* توقعات 5 أيام */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">📅 توقعات 5 أيام</h2>
                            <div className="grid grid-cols-5 gap-4">
                                {forecast.map((day, index) => (
                                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500 mb-2">
                                            {day.date.toLocaleDateString('ar-EG', { weekday: 'short' })}
                                        </div>
                                        <div className="text-2xl mb-2">🌡️</div>
                                        <div className="font-bold">{day.temp}°C</div>
                                        <div className="text-xs text-gray-500">{day.condition}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* التحليلات */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">📈 تطور مؤشر NDVI</h2>
                            <div className="h-80">
                                <Line data={ndviChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                )}

                {/* التوصيات */}
                {activeTab === 'recommendations' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">💡 توصيات ذكية للمزرعة</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                                    <div className="text-3xl mb-3">💧</div>
                                    <h3 className="font-bold text-lg mb-2">الري</h3>
                                    <p className="text-sm opacity-90">
                                        {weather?.humidity < 30 
                                            ? 'يوصى بالري اليومي بسبب انخفاض الرطوبة'
                                            : 'موعد الري التالي: بعد يومين'
                                        }
                                    </p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                                    <div className="text-3xl mb-3">🧪</div>
                                    <h3 className="font-bold text-lg mb-2">التسميد</h3>
                                    <p className="text-sm opacity-90">
                                        {farm.ndvi < 0.5
                                            ? 'يوصى بإضافة سماد نيتروجيني فوراً'
                                            : 'يوصى بإضافة سماد متوازن خلال أسبوع'
                                        }
                                    </p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                                    <div className="text-3xl mb-3">⚠️</div>
                                    <h3 className="font-bold text-lg mb-2">الآفات</h3>
                                    <p className="text-sm opacity-90">
                                        {farm.ndvi > 0.7
                                            ? 'لا توجد مؤشرات لوجود آفات'
                                            : 'يوصى بالفحص الدوري للآفات'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmDetails;