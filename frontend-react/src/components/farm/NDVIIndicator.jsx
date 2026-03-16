import React from 'react';

const NDVIIndicator = ({ value, showDetails = true, size = 'md' }) => {
    // تحديد حالة النبات بناءً على قيمة NDVI
    const getPlantStatus = (ndvi) => {
        if (ndvi >= 0.7) return {
            status: 'ممتاز',
            description: 'نبات صحي جداً، نمو خضري كثيف',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-500',
            progressColor: 'bg-green-600',
            icon: '🌿🌿🌿',
            action: 'حافظ على الري والتسميد'
        };
        if (ndvi >= 0.5) return {
            status: 'جيد',
            description: 'نبات صحي، نمو طبيعي',
            color: 'text-lime-600',
            bgColor: 'bg-lime-100',
            borderColor: 'border-lime-500',
            progressColor: 'bg-lime-600',
            icon: '🌿🌿',
            action: 'متابعة منتظمة موصى بها'
        };
        if (ndvi >= 0.3) return {
            status: 'متوسط',
            description: 'نبات يحتاج رعاية، نمو محدود',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-500',
            progressColor: 'bg-yellow-600',
            icon: '🌿',
            action: 'يفضل زيادة الري والتسميد'
        };
        if (ndvi >= 0.1) return {
            status: 'ضعيف',
            description: 'نبات متدهور، كثافة خضرية منخفضة',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            borderColor: 'border-orange-500',
            progressColor: 'bg-orange-600',
            icon: '🌱',
            action: 'تحتاج تدخل فوري: ري وتسميد مكثف'
        };
        return {
            status: 'حرج',
            description: 'لا يوجد غطاء نباتي أو نبات ميت',
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            borderColor: 'border-red-500',
            progressColor: 'bg-red-600',
            icon: '⚠️',
            action: 'إعادة زراعة المنطقة'
        };
    };

    const status = getPlantStatus(value);
    
    // تحديد حجم العرض
    const sizeClasses = {
        sm: { text: 'text-sm', title: 'text-base', padding: 'p-2' },
        md: { text: 'text-base', title: 'text-lg', padding: 'p-4' },
        lg: { text: 'text-lg', title: 'text-xl', padding: 'p-6' }
    }[size];

    return (
        <div className={`${status.bgColor} ${sizeClasses.padding} rounded-lg border-r-4 ${status.borderColor}`}>
            {/* رأس المؤشر */}
            <div className="flex justify-between items-center mb-3">
                <span className={`font-bold ${sizeClasses.title} ${status.color}`}>
                    {status.icon} {status.status}
                </span>
                <span className={`font-bold ${sizeClasses.title} ${status.color}`}>
                    {(value * 100).toFixed(0)}%
                </span>
            </div>

            {/* شريط التقدم */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                <div 
                    className={`${status.progressColor} h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${value * 100}%` }}
                ></div>
            </div>

            {/* الوصف والتوصية */}
            {showDetails && (
                <>
                    <p className={`${sizeClasses.text} text-gray-700 mb-2`}>
                        {status.description}
                    </p>
                    <div className={`${status.bgColor} bg-opacity-50 p-3 rounded-lg`}>
                        <span className={`font-medium ${status.color}`}>💡 توصية: </span>
                        <span className={sizeClasses.text}>{status.action}</span>
                    </div>
                </>
            )}
        </div>
    );
};


// مكون إضافي لعرض إحصائيات NDVI
export const NDVIStats = ({ stats }) => {
    if (!stats) return null;
    
    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-bold text-sm mb-2">إحصائيات NDVI</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <span className="text-gray-500">المتوسط:</span>
                    <span className="mr-1 font-medium">{stats.mean?.toFixed(3)}</span>
                </div>
                <div>
                    <span className="text-gray-500">الحد الأدنى:</span>
                    <span className="mr-1 font-medium">{stats.min?.toFixed(3)}</span>
                </div>
                <div>
                    <span className="text-gray-500">الحد الأقصى:</span>
                    <span className="mr-1 font-medium">{stats.max?.toFixed(3)}</span>
                </div>
                <div>
                    <span className="text-gray-500">الانحراف:</span>
                    <span className="mr-1 font-medium">{stats.std?.toFixed(3)}</span>
                </div>
            </div>
        </div>
    );
};



// مكون إضافي لعرض تطور NDVI عبر الزمن
export const NDVIHistoryChart = ({ history = [] }) => {
    // إذا لم يكن هناك تاريخ، نعرض بيانات تجريبية
    const data = history.length ? history : [0.45, 0.52, 0.61, 0.68, 0.72, 0.75];
    
    const maxValue = Math.max(...data, 0.8);
    const minValue = Math.min(...data, 0.3);
    
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg mb-4">📈 تطور مؤشر NDVI</h3>
            <div className="h-40 flex items-end gap-2">
                {data.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                            <div 
                                className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-300"
                                style={{ height: `${(value / maxValue) * 100}%` }}
                            >
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                                    {(value * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                            {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'][index]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NDVIIndicator;