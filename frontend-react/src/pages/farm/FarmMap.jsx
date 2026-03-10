import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { getFarms } from '../../services/farm/farmService';
import { getCurrentWeather } from '../../services/farm/weatherService';

const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const mapOptions = {
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true
};

const defaultCenter = {
    lat: 33.3152,
    lng: 44.3661
};

const libraries = ['places'];

// دالة تنسيق التاريخ المحلية (إذا لم تكن موجودة)
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

const FarmMap = () => {
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [weatherData, setWeatherData] = useState({});

    useEffect(() => {
        loadFarms();
    }, []);

    useEffect(() => {
        if (selectedFarm) {
            loadWeatherForFarm(selectedFarm);
        }
    }, [selectedFarm]);

    const loadFarms = async () => {
        try {
            setLoading(true);
            const data = await getFarms();
            console.log('Farms loaded:', data);
            setFarms(data || []);
        } catch (error) {
            console.error('Error loading farms:', error);
            setFarms([]);
        } finally {
            setLoading(false);
        }
    };

    const loadWeatherForFarm = async (farm) => {
        try {
            const weather = await getCurrentWeather(farm.location.lat, farm.location.lng);
            setWeatherData(prev => ({ ...prev, [farm.id]: weather }));
        } catch (error) {
            console.error('Error loading weather:', error);
        }
    };

    const getMarkerColor = (ndvi) => {
        if (ndvi > 0.7) return 'green';
        if (ndvi > 0.5) return 'yellow';
        return 'red';
    };

    const getMarkerIcon = (color) => {
        return {
            url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
            scaledSize: { width: 40, height: 40 }
        };
    };

    const getStatusText = (ndvi) => {
        if (ndvi > 0.7) return { text: 'ممتاز', color: 'text-green-600' };
        if (ndvi > 0.5) return { text: 'جيد', color: 'text-yellow-600' };
        return { text: 'تحت الرعاية', color: 'text-red-600' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🗺️ خريطة مزارع البطاطا</h1>
                    <p className="text-gray-600 mt-1">عرض ومتابعة المزارع في العراق</p>
                </div>
                <button 
                    onClick={() => setMapCenter(defaultCenter)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    العودة للعراق
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">إجمالي المزارع</div>
                    <div className="text-3xl font-bold">{farms.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">ممتازة</div>
                    <div className="text-3xl font-bold text-green-600">
                        {farms.filter(f => f.ndvi > 0.7).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">جيدة</div>
                    <div className="text-3xl font-bold text-yellow-600">
                        {farms.filter(f => f.ndvi > 0.5 && f.ndvi <= 0.7).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">تحتاج رعاية</div>
                    <div className="text-3xl font-bold text-red-600">
                        {farms.filter(f => f.ndvi <= 0.5).length}
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="mb-6" style={{ height: '600px', width: '100%' }}>
                <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                    loadingElement={
                        <div style={{ 
                            height: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '12px'
                        }}>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    }
                >
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={7}
                        options={mapOptions}
                    >
                        {farms.map((farm) => (
                            <Marker
                                key={farm.id}
                                position={farm.location}
                                icon={getMarkerIcon(getMarkerColor(farm.ndvi))}
                                onClick={() => setSelectedFarm(farm)}
                            />
                        ))}

                        {selectedFarm && (
                            <InfoWindow
                                position={selectedFarm.location}
                                onCloseClick={() => setSelectedFarm(null)}
                            >
                                <div className="p-3 max-w-xs" dir="rtl">
                                    <h3 className="font-bold text-lg mb-2">{selectedFarm.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <p>📏 المساحة: {selectedFarm.area} دونم</p>
                                        <p>🌾 الصنف: {selectedFarm.cropType}</p>
                                         <p>📅 الزراعة: {formatDateLocal(selectedFarm.plantingDate)}</p>
                                        <p className={getStatusText(selectedFarm.ndvi).color}>
                                            🌱 NDVI: {selectedFarm.ndvi} ({getStatusText(selectedFarm.ndvi).text})
                                        </p>
                                        {weatherData[selectedFarm.id] && (
                                            <>
                                                <p className="font-medium mt-2 pt-2 border-t">🌤️ الطقس الآن:</p>
                                                <p>🌡️ {weatherData[selectedFarm.id].temp}°C</p>
                                                <p>💧 {weatherData[selectedFarm.id].humidity}%</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </LoadScript>
            </div>

            {/* Farms List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">📋 قائمة المزارع</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {farms.map((farm) => {
                        const status = getStatusText(farm.ndvi);
                        return (
                            <div 
                                key={farm.id}
                                className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                                onClick={() => {
                                    setSelectedFarm(farm);
                                    setMapCenter(farm.location);
                                }}
                            >
                                <h3 className="font-bold mb-2">{farm.name}</h3>
                                <p>📏 {farm.area} دونم</p>
                                <p>🌱 {farm.cropType}</p>
                                <p className={status.color}>NDVI: {farm.ndvi} ({status.text})</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FarmMap;