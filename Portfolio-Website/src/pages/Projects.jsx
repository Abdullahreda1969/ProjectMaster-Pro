import React from 'react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const projects = [
    {
      title: 'ProjectMaster-Pro',
      description: 'نظام متكامل لإدارة المشاريع مع منصة زراعية ذكية',
      image: '📊',
      technologies: ['React', 'Node.js', 'MongoDB', 'Google Maps', 'OpenWeather'],
      features: ['إدارة المشاريع', 'خرائط المزارع', 'الطقس و NDVI', 'الفواتير'],
      demo: 'https://projectmaster-pro.netlify.app',
      github: 'https://github.com/Abdullahreda1969/ProjectMaster-Pro',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      title: 'PotatoMap',
      description: 'منصة زراعية ذكية لمراقبة المزارع باستخدام الأقمار الصناعية',
      image: '🗺️',
      technologies: ['React', 'Google Maps', 'Agro API', 'OpenWeather'],
      features: ['خرائط تفاعلية', 'مؤشرات NDVI', 'بيانات الطقس', 'تتبع المحاصيل'],
      demo: 'https://projectmaster-pro.netlify.app/farm',
      github: 'https://github.com/Abdullahreda1969/ProjectMaster-Pro',
      gradient: 'from-green-600 to-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* عنوان الصفحة */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              مشاريعي
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            نماذج حقيقية لأنظمة قمت ببنائها من الصفر وتعمل على الإنترنت
          </p>
        </div>

        {/* قائمة المشاريع */}
        <div className="space-y-12 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${project.gradient} p-8 rounded-2xl shadow-2xl`}
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* أيقونة المشروع */}
                <div className="text-7xl bg-white/10 rounded-2xl w-32 h-32 flex items-center justify-center">
                  {project.image}
                </div>

                {/* معلومات المشروع */}
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-3">{project.title}</h3>
                  <p className="text-white/90 mb-4 text-lg">{project.description}</p>

                  {/* التقنيات */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">التقنيات المستخدمة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* المميزات */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">المميزات:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {project.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span>✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* روابط المشروع */}
                  <div className="flex gap-4">
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                    >
                      عرض مباشر
                    </a>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;