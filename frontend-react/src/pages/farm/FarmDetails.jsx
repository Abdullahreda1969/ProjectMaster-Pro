import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFarmById } from '../../services/farm/farmService';
import { getCurrentWeather, getWeatherForecast } from '../../services/farm/weatherService';
import { getLatestNDVI, getNDVIHistory, createFarmPolygon } from '../../services/farm/agroService';
import { updateFarm } from '../../services/farm/farmService';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
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

const FarmDetails = () => {
    const { id } = useParams();
    const [farm, setFarm] = useState(null);
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    const [ndviData, setNdviData] = useState(null);
    const [ndviHistory, setNdviHistory] = useState([]);
    const [ndviLoading, setNdviLoading] = useState(false);

    useEffect(() => {
        loadFarmData();
    }, [id]);

    const loadFarmData = async () => {
    try {
        setLoading(true);
        
        const farmData = await getFarmById(id);
        setFarm(farmData);
        
        if (farmData) {
            // جلب بيانات الطقس
            try {
                const weatherData = await getCurrentWeather(farmData.location.lat, farmData.location.lng);
                setWeather(weatherData);
                
                const forecastData = await getWeatherForecast(farmData.location.lat, farmData.location.lng);
                setForecast(forecastData);
            } catch (weatherError) {
                console.error('خطأ في جلب الطقس:', weatherError);
            }
            
            // التحقق من وجود polygonId
            let currentPolygonId = farmData.polygonId;
            
            // إذا لم يكن هناك polygonId، قم بإنشائه
            if (!currentPolygonId) {
                console.log('⚠️ لا يوجد polygonId لهذه المزرعة، جاري إنشاؤه...');
                currentPolygonId = await createPolygonForFarm(farmData);
            }
            
            // جلب NDVI باستخدام polygonId (سواء كان موجوداً أو تم إنشاؤه الآن)
            if (currentPolygonId) {
                await loadRealNDVI(currentPolygonId);
            } else {
                console.log('❌ فشل في الحصول على polygonId');
            }
        }
    } catch (error) {
        console.error('Error loading farm data:', error);
        toast.error('فشل في تحميل بيانات المزرعة');
    } finally {
        setLoading(false);
    }
};

    // دالة لإنشاء polygon للمزرعة
    const createPolygonForFarm = async (farmData) => {
        try {
            console.log('🔧 محاولة إنشاء polygon للمزرعة:', farmData.name);
            
            const result = await createFarmPolygon(
                farmData.location.lat,
                farmData.location.lng,
                farmData.name
            );
            
            if (result?.id) {
                console.log('✅ تم إنشاء polygon بنجاح:', result.id);
                
                // تحديث المزرعة في قاعدة البيانات بالـ polygon_id الجديد
                const updateResult = await updateFarm(farmData._id, {
                    polygonId: result.id
                });
                
                if (updateResult.success) {
                    console.log('✅ تم تحديث المزرعة بالـ polygon_id');
                    // تحديث حالة المزرعة محلياً
                    setFarm(prev => ({ ...prev, polygonId: result.id }));
                    return result.id;
                }
            }
            return null;
        } catch (error) {
            console.error('❌ خطأ في إنشاء polygon:', error);
            return null;
        }
    };

    const loadRealNDVI = async (currentPolygonId) => {
        if (!currentPolygonId) return;
        
        try {
            setNdviLoading(true);
            
            const latest = await getLatestNDVI(currentPolygonId);
            if (latest) setNdviData(latest);
            
            const history = await getNDVIHistory(currentPolygonId, 3);
            if (history.length > 0) setNdviHistory(history);
            
        } catch (error) {
            console.error('❌ خطأ في تحميل NDVI:', error);
        } finally {
            setNdviLoading(false);
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: { 
                rtl: true,
                callbacks: {
                    label: (ctx) => `NDVI: ${(ctx.raw * 100).toFixed(1)}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1,
                title: { display: true, text: 'NDVI' },
                ticks: { callback: (value) => `${(value * 100).toFixed(0)}%` }
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
                <button 
                    onClick={() => window.history.back()}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    العودة
                </button>
            </div>
        );
    }

    return (
        <div className="p-6" dir="rtl">
            {/* رأس الصفحة */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Link to="/farm" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                            <span className="text-xl">←</span>
                            <span>العودة للخريطة</span>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{farm.name}</h1>
                            <p className="text-gray-600 mt-1">تفاصيل وتحليلات المزرعة</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-white ${getStatusColor(farm.ndvi || 0.5)}`}>
                        {getStatusText(farm.ndvi || 0.5)}
                    </div>
                </div>
            </div>

            {/* تبويبات التنقل */}
            <div className="flex gap-2 mb-6 border-b">
                {['overview', 'weather', 'analytics', 'recommendations'].map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 font-medium transition ${
                            activeTab === tab 
                                ? 'text-green-600 border-b-2 border-green-600' 
                                : 'text-gray-500'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'overview' && '📊 نظرة عامة'}
                        {tab === 'weather' && '🌤️ الطقس'}
                        {tab === 'analytics' && '📈 التحليلات'}
                        {tab === 'recommendations' && '💡 التوصيات'}
                    </button>
                ))}
            </div>

            {/* المحتوى */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
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

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">🌱 مؤشر صحة النبات (NDVI)</h2>
                            <div className="flex items-center gap-6">
                                <div className="text-6xl font-bold text-green-600">
                                    {((farm.ndvi || 0.5) * 100).toFixed(0)}%
                                </div>
                                <div className="flex-1">
                                    <div className="w-full bg-gray-200 rounded-full h-6">
                                        <div 
                                            className={`h-6 rounded-full ${getStatusColor(farm.ndvi || 0.5)}`}
                                            style={{ width: `${(farm.ndvi || 0.5) * 100}%` }}
                                        />
                                    </div>
                                    <p className="mt-2 text-gray-600">
                                        {(farm.ndvi || 0.5) > 0.7 
                                            ? 'المحصول في حالة ممتازة - استمر في الرعاية'
                                            : (farm.ndvi || 0.5) > 0.5
                                            ? 'المحصول في حالة جيدة - يوصى بالمراقبة المنتظمة'
                                            : 'المحصول يحتاج إلى رعاية فورية - يوصى بالري والتسميد'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'weather' && weather && (
                    <div className="space-y-6">
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

                        {forecast.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">📅 توقعات 5 أيام</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {forecast.map((day, index) => {
                                        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                                        const dayName = dayNames[day.date.getDay()];
                                        
                                        return (
                                            <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                                                <div className="text-sm font-bold text-gray-700 mb-2">{dayName}</div>
                                                <div className="text-3xl mb-2">🌡️</div>
                                                <div className="text-xl font-bold text-blue-600">{day.temp}°C</div>
                                                <div className="text-xs text-gray-600 mt-2">{day.condition}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {day.date.toLocaleDateString('ar-EG')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* التحليلات */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {ndviLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                <p className="mr-4">جلب بيانات NDVI من الأقمار الصناعية...</p>
                            </div>
                        ) : (
                            <>
                                {ndviData ? (
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h2 className="text-xl font-bold mb-4">🛰️ آخر قياس NDVI</h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <div className={`text-6xl font-bold mb-4 ${
                                                    ndviData.ndvi > 0.7 ? 'text-green-600' : 
                                                    ndviData.ndvi > 0.5 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {(ndviData.ndvi * 100).toFixed(0)}%
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-4">
                                                    <div 
                                                        className={`h-4 rounded-full ${
                                                            ndviData.ndvi > 0.7 ? 'bg-green-600' : 
                                                            ndviData.ndvi > 0.5 ? 'bg-yellow-600' : 'bg-red-600'
                                                        }`}
                                                        style={{ width: `${ndviData.ndvi * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {ndviData.cloudCover}% غطاء سحابي
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-2">تفاصيل القياس:</p>
                                                <ul className="space-y-2">
                                                    <li>📅 التاريخ: {ndviData.date.toLocaleDateString('ar-EG')}</li>
                                                    <li>🛰️ المصدر: {ndviData.source}</li>
                                                    <li>📊 المتوسط: {(ndviData.ndvi * 100).toFixed(1)}%</li>
                                                    <li>📉 الأدنى: {(ndviData.min * 100).toFixed(1)}%</li>
                                                    <li>📈 الأقصى: {(ndviData.max * 100).toFixed(1)}%</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                        <p className="text-yellow-700">لا توجد بيانات NDVI متاحة للمنطقة المحددة</p>
                                        <p className="text-sm text-yellow-600 mt-2">
                                            قد لا تتوفر صور حديثة بسبب الغطاء السحابي أو دورة القمر الصناعي
                                        </p>
                                    </div>
                                )}

                                {ndviHistory.length > 0 && (
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h2 className="text-xl font-bold mb-4">📈 تطور NDVI خلال 3 أشهر</h2>
                                        <div className="h-80">
                                            <Line 
                                                data={{
                                                    labels: ndviHistory.map(item => 
                                                        item.date.toLocaleDateString('ar-EG')
                                                    ),
                                                    datasets: [{
                                                        label: 'NDVI',
                                                        data: ndviHistory.map(item => item.value),
                                                        borderColor: 'rgb(34, 197, 94)',
                                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                        tension: 0.4,
                                                        fill: true
                                                    }]
                                                }} 
                                                options={chartOptions}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-6">💡 توصيات ذكية</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white bg-opacity-20 rounded-lg p-6">
                                <div className="text-3xl mb-3">💧</div>
                                <h3 className="font-bold text-lg mb-2">الري</h3>
                                <p className="text-sm">
                                    {weather?.humidity < 30 ? 'ري يومي' : 'ري بعد يومين'}
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-6">
                                <div className="text-3xl mb-3">🧪</div>
                                <h3 className="font-bold text-lg mb-2">التسميد</h3>
                                <p className="text-sm">
                                    {(farm.ndvi || 0.5) < 0.5 ? 'تسميد فوري' : 'تسميد خلال أسبوع'}
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-6">
                                <div className="text-3xl mb-3">⚠️</div>
                                <h3 className="font-bold text-lg mb-2">الآفات</h3>
                                <p className="text-sm">
                                    {(farm.ndvi || 0.5) > 0.7 ? 'لا توجد' : 'فحص دوري'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmDetails;