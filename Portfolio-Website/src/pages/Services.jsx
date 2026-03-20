import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      icon: '📊',
      title: 'نظام إدارة مشاريع متكامل',
      description: 'بناء نظام مخصص لشركتك يشمل إدارة المشاريع والمهام والفرق والفواتير، مشابه لـ ProjectMaster-Pro.',
      features: ['إدارة المشاريع', 'تتبع المهام', 'إدارة الفرق', 'الفواتير'],
      price: 'يبدأ من 1500$',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      icon: '🗺️',
      title: 'منصة زراعية ذكية',
      description: 'نظام متكامل لمراقبة المزارع باستخدام خرائط Google وبيانات الطقس الحقيقية ومؤشرات NDVI.',
      features: ['خرائط تفاعلية', 'بيانات طقس حية', 'مؤشرات NDVI', 'تتبع المحاصيل'],
      price: 'يبدأ من 2000$',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      icon: '🌐',
      title: 'تطبيقات ويب مخصصة',
      description: 'بناء تطبيقات ويب كاملة حسب احتياجاتك باستخدام أحدث التقنيات (React, Node.js, MongoDB).',
      features: ['تصميم حسب الطلب', 'قاعدة بيانات', 'واجهات تفاعلية', 'نشر على الإنترنت'],
      price: 'حسب المشروع',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: '🚀',
      title: 'نشر واستضافة المشاريع',
      description: 'نشر مشروعك على الإنترنت باستخدام Netlify, Railway, أو Fly.io مع إعداد DNS وشهادات SSL.',
      features: ['نشر آمن', 'نطاق مخصص', 'شهادة SSL', 'دعم فني'],
      price: 'يبدأ من 300$',
      gradient: 'from-yellow-600 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* عنوان الصفحة */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              خدماتي
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            أقدم حلولاً برمجية متكاملة تساعد الشركات والمزارعين على إدارة أعمالهم بكفاءة
          </p>
        </div>

        {/* بطاقات الخدمات */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${service.gradient} p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition duration-300`}
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
              <p className="text-white/90 mb-4">{service.description}</p>
              
              {/* المميزات */}
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-white">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* السعر وزر التواصل */}
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{service.price}</span>
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
                >
                  تواصل للمناقشة
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* لماذا أختارني */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار العمل معي؟</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-2">خبرة عملية</h3>
              <p className="text-gray-400">بناء أنظمة حقيقية تعمل على الإنترنت مثل ProjectMaster-Pro</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-2">دعم فني</h3>
              <p className="text-gray-400">دعم مستمر بعد التسليم وضمان رضا العملاء</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">تسليم سريع</h3>
              <p className="text-gray-400">التزام بالمواعيد وتسليم مشاريع بجودة عالية</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;