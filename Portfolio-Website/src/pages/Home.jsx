import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* الاسم والشعار */}
        <div className="text-center mb-16">
          <div className="inline-block p-1 px-4 mb-6 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-400">
            👋 مرحباً، أنا
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              عبدالله رضا
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            مطور برمجيات متكامل | Full Stack Developer
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/Abdullahreda1969" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-xl">🐙</span> GitHub
            </a>
            <a 
              href="https://linkedin.com/in/abdullahreda" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-xl">🔗</span> LinkedIn
            </a>
          </div>
        </div>

        {/* المشروع الرئيسي */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            مشروعي المميز
          </h2>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
              <h3 className="text-3xl font-bold mb-2">ProjectMaster-Pro</h3>
              <p className="text-xl text-white/90">نظام إدارة مشاريع متكامل مع منصة زراعية ذكية</p>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">📊</span>
                    <div>
                      <h4 className="font-bold">إدارة المشاريع</h4>
                      <p className="text-gray-400">مشاريع، مهام، فرق، فواتير</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center text-green-400">🗺️</span>
                    <div>
                      <h4 className="font-bold">خرائط المزارع</h4>
                      <p className="text-gray-400">PotatoMap مع Google Maps</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center text-yellow-400">🌤️</span>
                    <div>
                      <h4 className="font-bold">الطقس و NDVI</h4>
                      <p className="text-gray-400">بيانات حقيقية من OpenWeather و Agro API</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <a 
                    href="https://projectmaster-pro.netlify.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-center font-semibold transition"
                  >
                    🚀 عرض المشروع مباشرة
                  </a>
                  
                  <a 
                    href="https://github.com/Abdullahreda1969/ProjectMaster-Pro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-center font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span>🐙</span> عرض على GitHub
                  </a>
                  
                  <a 
                    href="https://projectmaster-pro.netlify.app/farm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-center font-semibold transition border border-gray-600"
                  >
                    🗺️ خريطة المزارع
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* التقنيات المستخدمة */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            التقنيات المستخدمة
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'React', icon: '⚛️', color: 'from-cyan-600 to-cyan-400' },
              { name: 'Node.js', icon: '🟢', color: 'from-green-600 to-green-400' },
              { name: 'MongoDB', icon: '🍃', color: 'from-emerald-600 to-emerald-400' },
              { name: 'Tailwind', icon: '🎨', color: 'from-sky-600 to-sky-400' },
              { name: 'Google Maps', icon: '🗺️', color: 'from-red-600 to-red-400' },
              { name: 'OpenWeather', icon: '🌤️', color: 'from-yellow-600 to-yellow-400' },
              { name: 'Fly.io', icon: '🚀', color: 'from-purple-600 to-purple-400' },
              { name: 'Netlify', icon: '🌐', color: 'from-blue-600 to-blue-400' },
            ].map((tech, index) => (
              <div key={index} className={`bg-gradient-to-br ${tech.color} p-4 rounded-xl text-center`}>
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="font-semibold">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* التذييل */}
        <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2026 عبدالله رضا - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default Home;