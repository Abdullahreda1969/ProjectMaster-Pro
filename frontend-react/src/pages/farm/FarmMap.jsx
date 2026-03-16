import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, LoadScriptNext, Marker, InfoWindow } from '@react-google-maps/api';
import { getFarms } from '../../services/farm/farmService';
import { toast } from 'react-hot-toast';

const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 33.3152,
    lng: 44.3661
};

const FarmMap = () => {
    const [editingId, setEditingId] = useState(null);
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newFarm, setNewFarm] = useState({
        name: '',
        location: { lat: defaultCenter.lat, lng: defaultCenter.lng },
        area: '',
        cropType: 'بطاطا'
    });
    const mapRef = useRef(null);
    const location = useLocation();

    // تحميل المزارع
    useEffect(() => {
        loadFarms();
    }, []);

    // جلب الطقس للمزرعة المحددة
    useEffect(() => {
        if (!selectedFarm) return;
        
        const loadWeather = async () => {
            try {
                const { getCurrentWeather } = await import('../../services/farm/weatherService');
                const weather = await getCurrentWeather(selectedFarm.location.lat, selectedFarm.location.lng);
                setWeatherData(prev => ({ ...prev, [selectedFarm._id]: weather }));
            } catch (error) {
                console.error('خطأ في جلب الطقس:', error);
            }
        };
        
        loadWeather();
    }, [selectedFarm]);

    // إعادة حساب حجم الخريطة عند الرجوع للصفحة
    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => {
                window.google.maps.event.trigger(mapRef.current, "resize");
            }, 300);
        }
    }, [location.pathname]);

    const loadFarms = async () => {
        try {
            const data = await getFarms();
            setFarms(data || []);
        } catch (error) {
            console.error('خطأ في تحميل المزارع:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFarm = async (e) => {
        e.preventDefault();
        
        if (!newFarm.name || !newFarm.area) {
            toast.error('الرجاء إدخال اسم المزرعة والمساحة');
            return;
        }

        try {
            let response;
            if (editingId) {
                const { updateFarm } = await import('../../services/farm/farmService');
                response = await updateFarm(editingId, newFarm);
                if (response.success) {
                    toast.success('تم تحديث المزرعة بنجاح');
                }
            } else {
                const { addFarm } = await import('../../services/farm/farmService');
                response = await addFarm(newFarm);
                if (response.success) {
                    toast.success('تم إضافة المزرعة بنجاح');
                }
            }

            if (response?.success) {
                setShowForm(false);
                setEditingId(null);
                loadFarms();
                setNewFarm({
                    name: '',
                    location: { lat: defaultCenter.lat, lng: defaultCenter.lng },
                    area: '',
                    cropType: 'بطاطا'
                });
            }
        } catch (error) {
            console.error('خطأ في حفظ المزرعة:', error);
            toast.error(editingId ? 'فشل في تحديث المزرعة' : 'فشل في إضافة المزرعة');
        }
    };

    const getMarkerColor = (ndvi) => {
        if (ndvi > 0.7) return 'green';
        if (ndvi > 0.5) return 'yellow';
        return 'red';
    };

    const getStatusText = (ndvi) => {
        if (ndvi > 0.7) return { text: 'ممتاز', color: 'text-green-600' };
        if (ndvi > 0.5) return { text: 'جيد', color: 'text-yellow-600' };
        return { text: 'تحت الرعاية', color: 'text-red-600' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'غير محدد';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG');
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mr-4">جاري تحميل المزارع...</p>
            </div>
        );
    }

    const handleEdit = (farm) => {
        setNewFarm({
            name: farm.name,
            location: farm.location,
            area: farm.area,
            cropType: farm.cropType,
            id: farm._id || farm.id
        });
        setShowForm(true);
        setEditingId(farm._id || farm.id);
    };

    const handleDelete = async (farm) => {
        if (!farm) {
            toast.error('بيانات المزرعة غير صالحة');
            return;
        }

        const farmId = farm.id || farm._id;
        
        if (!farmId) {
            console.error('❌ المزرعة لا تحتوي على ID:', farm);
            toast.error('معرّف المزرعة غير صالح');
            return;
        }
        
        if (!window.confirm(`هل أنت متأكد من حذف مزرعة "${farm.name}"؟`)) return;
        
        try {
            console.log('🔍 محاولة حذف مزرعة بالـ ID:', farmId);
            
            const { deleteFarm } = await import('../../services/farm/farmService');
            const response = await deleteFarm(farmId);
            
            if (response.success) {
                toast.success('تم حذف المزرعة بنجاح');
                
                setFarms(prevFarms => prevFarms.filter(f => 
                    (f.id || f._id) !== farmId
                ));
                
                if (selectedFarm && (selectedFarm.id === farmId || selectedFarm._id === farmId)) {
                    setSelectedFarm(null);
                }
            }
        } catch (error) {
            console.error('❌ خطأ في حذف المزرعة:', error);
            toast.error(error.response?.data?.message || 'فشل في حذف المزرعة');
        }
    };

    return (
        <div className="p-6" dir="rtl">
            {/* رأس الصفحة مع زر الإضافة */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">🗺️ خريطة المزارع</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    <span>مزرعة جديدة</span>
                </button>
            </div>

            {/* نموذج إضافة مزرعة */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">{editingId ? 'تعديل المزرعة' : 'إضافة مزرعة جديدة'}</h2>
                        <form onSubmit={handleAddFarm} className="space-y-4">
                            {/* محتوى النموذج كما هو */}
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المزرعة</label>
                                <input
                                    type="text"
                                    value={newFarm.name}
                                    onChange={(e) => setNewFarm({...newFarm, name: e.target.value})}
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">خط العرض (Latitude)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={newFarm.location.lat}
                                    onChange={(e) => setNewFarm({
                                        ...newFarm,
                                        location: { ...newFarm.location, lat: parseFloat(e.target.value) }
                                    })}
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">خط الطول (Longitude)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={newFarm.location.lng}
                                    onChange={(e) => setNewFarm({
                                        ...newFarm,
                                        location: { ...newFarm.location, lng: parseFloat(e.target.value) }
                                    })}
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">المساحة (دونم)</label>
                                <input
                                    type="number"
                                    value={newFarm.area}
                                    onChange={(e) => setNewFarm({...newFarm, area: e.target.value})}
                                    className="w-full border rounded-lg p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">نوع المحصول</label>
                                <select
                                    value={newFarm.cropType}
                                    onChange={(e) => setNewFarm({...newFarm, cropType: e.target.value})}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="بطاطا">بطاطا</option>
                                    <option value="قمح">قمح</option>
                                    <option value="شعير">شعير</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-1">
                                    {editingId ? 'تحديث' : 'إضافة'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex-1">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">إجمالي المزارع</div>
                    <div className="text-3xl font-bold">{farms.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">ممتازة (NDVI {'>'} 0.7)</div>
                    <div className="text-3xl font-bold text-green-600">
                        {farms.filter(f => f.ndvi > 0.7).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">جيدة (NDVI 0.5-0.7)</div>
                    <div className="text-3xl font-bold text-yellow-600">
                        {farms.filter(f => f.ndvi > 0.5 && f.ndvi <= 0.7).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">تحتاج رعاية (NDVI &lt; 0.5)</div>
                    <div className="text-3xl font-bold text-red-600">
                        {farms.filter(f => f.ndvi <= 0.5).length}
                    </div>
                </div>
            </div>

            {/* الخريطة - أولاً */}
            <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    key={location.pathname}
                    mapContainerStyle={mapContainerStyle}
                    center={defaultCenter}
                    zoom={7}
                    onClick={(e) => {
                        setNewFarm(prev => ({
                            ...prev,
                            location: {
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng()
                            }
                        }));
                    }}
                    onLoad={(map) => {
                        console.log("✅ الخريطة جاهزة");
                        mapRef.current = map;
                        window.google.maps.event.trigger(map, "resize");
                    }}
                >
                    {farms.map((farm) => (
                        <Marker
                            key={farm._id}
                            position={farm.location}
                            icon={{
                                url: `http://maps.google.com/mapfiles/ms/icons/${getMarkerColor(farm.ndvi)}-dot.png`,
                                scaledSize: { width: 40, height: 40 }
                            }}
                            onClick={() => setSelectedFarm(farm)}
                        />
                    ))}

                    {selectedFarm && (
                        <InfoWindow
                            position={selectedFarm.location}
                            onCloseClick={() => setSelectedFarm(null)}
                        >
                            <div className="p-2" style={{ minWidth: '250px' }}>
                                <h3 className="font-bold text-lg mb-2">{selectedFarm.name}</h3>
                                
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">مؤشر NDVI</span>
                                        <span className={`font-bold ${getStatusText(selectedFarm.ndvi).color}`}>
                                            {selectedFarm.ndvi}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className={`h-2.5 rounded-full ${
                                                selectedFarm.ndvi > 0.7 ? 'bg-green-600' : 
                                                selectedFarm.ndvi > 0.5 ? 'bg-yellow-600' : 'bg-red-600'
                                            }`}
                                            style={{ width: `${selectedFarm.ndvi * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className={`text-xs mt-1 ${getStatusText(selectedFarm.ndvi).color}`}>
                                        {getStatusText(selectedFarm.ndvi).text}
                                    </p>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <p>📏 المساحة: {selectedFarm.area} دونم</p>
                                    <p>🌾 الصنف: {selectedFarm.cropType}</p>
                                    <p>📅 الزراعة: {formatDate(selectedFarm.plantingDate)}</p>
                                    
                                    {weatherData[selectedFarm._id] && (
                                        <>
                                            <p className="font-bold mt-2 pt-2 border-t">🌤️ الطقس الآن:</p>
                                            <p>🌡️ {weatherData[selectedFarm._id].temp}°C</p>
                                            <p>💧 {weatherData[selectedFarm._id].humidity}%</p>
                                            <p>💨 {weatherData[selectedFarm._id].windSpeed} كم/س</p>
                                            <p>☁️ {weatherData[selectedFarm._id].condition}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScriptNext>

            {/* قائمة المزارع - ثانياً */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">📋 قائمة المزارع ({farms.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farms.map(farm => {
                        const status = getStatusText(farm.ndvi);
                        return (
                            <div
                                key={farm._id}
                                className="border rounded-lg p-4 hover:shadow-lg transition relative group"
                            >
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(farm); }} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-lg" title="تعديل">✏️</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(farm); }} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg" title="حذف">🗑️</button>
                                    <button onClick={(e) => { e.stopPropagation(); window.location.href = `/farm/${farm._id}`; }} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow-lg" title="عرض التفاصيل">📊</button>
                                </div>
                                <div 
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedFarm(farm);
                                        if (mapRef.current) {
                                            mapRef.current.panTo(farm.location);
                                            mapRef.current.setZoom(12);
                                        }
                                    }}
                                >
                                    <h3 className="font-bold text-lg mb-2">{farm.name}</h3>
                                    <div className="space-y-1 text-sm">
                                        <p>📏 المساحة: {farm.area} دونم</p>
                                        <p>🌾 المحصول: {farm.cropType}</p>
                                        <p className={status.color}>🌱 NDVI: {farm.ndvi} ({status.text})</p>
                                        <p>📅 الزراعة: {formatDate(farm.plantingDate)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FarmMap;