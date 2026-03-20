import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // FormSubmit سيتعامل مع الإرسال
    // سنستخدم fetch لإرسال البيانات
    try {
      const response = await fetch('https://formsubmit.co/ajax/abdallahreda1969@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          project: formData.project,
          message: formData.message,
          _template: 'table',
          _subject: 'رسالة جديدة من موقعك الشخصي'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('✅ تم إرسال الرسالة بنجاح! سأتواصل معك قريباً');
        setFormData({ name: '', email: '', project: '', message: '' });
      } else {
        toast.error('❌ فشل في الإرسال. حاول مرة أخرى');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ حدث خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* عنوان الصفحة */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              تواصل معي
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            أخبرني عن مشروعك وسأتواصل معك في أقرب وقت
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* معلومات التواصل */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">معلومات التواصل</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📧</div>
                <div>
                  <h4 className="font-semibold mb-1">البريد الإلكتروني</h4>
                  <p className="text-gray-400">abdallahreda1969@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-3xl">📱</div>
                <div>
                  <h4 className="font-semibold mb-1">رقم الجوال</h4>
                  <p className="text-gray-400">+964 750 269 4581</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-3xl">🌐</div>
                <div>
                  <h4 className="font-semibold mb-1">وسائل التواصل</h4>
                  <div className="flex gap-4 mt-2">
                    <a href="https://github.com/Abdullahreda1969" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-2xl transition">
                      🐙
                    </a>
                    <a href="https://linkedin.com/in/abdullahreda" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-2xl transition">
                      🔗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* نموذج التواصل */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">أرسل رسالة</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نوع المشروع</label>
                <select
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">اختر نوع المشروع</option>
                  <option value="نظام إدارة">نظام إدارة مشاريع</option>
                  <option value="منصة زراعية">منصة زراعية ذكية</option>
                  <option value="تطبيق ويب">تطبيق ويب مخصص</option>
                  <option value="نشر واستضافة">نشر واستضافة</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الرسالة</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;