import React, { useState, useEffect } from 'react';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject} from '../services/projectService';
import toast from 'react-hot-toast';

const Projects = () => {
  // حالات المشاريع
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalBudget: 0
  });

  // حالات النموذج
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    budget: '',
    startDate: '',
    endDate: '',
    clientName: '',
    clientEmail: '',
    priority: 'medium'
  });

  // حالات البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchProjects();
  }, []);

  // تحديث المشاريع المفلترة عند تغيير البحث أو التصفية
  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, statusFilter, sortBy]);

  // جلب المشاريع من API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      
      if (response.success) {
        setProjects(response.projects);
        calculateStats(response.projects);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('فشل في تحميل المشاريع');
      toast.error('فشل في تحميل المشاريع');
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const calculateStats = (projectsList) => {
    const stats = {
      total: projectsList.length,
      active: projectsList.filter(p => p.status === 'active').length,
      completed: projectsList.filter(p => p.status === 'completed').length,
      totalBudget: projectsList.reduce((sum, p) => sum + (p.budget || 0), 0)
    };
    setStats(stats);
  };

  // تصفية وترتيب المشاريع
  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // تطبيق البحث
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تطبيق تصفية الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // تطبيق الترتيب
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'budget':
        filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  };

  // التعامل مع تغيير المدخلات
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // فتح نموذج الإضافة
  const handleAddNew = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      budget: '',
      startDate: '',
      endDate: '',
      clientName: '',
      clientEmail: '',
      priority: 'medium'
    });
    setShowForm(true);
  };

  // فتح نموذج التعديل
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
      budget: project.budget || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      clientName: project.clientName || '',
      clientEmail: project.clientEmail || '',
      priority: project.priority || 'medium'
    });
    setShowForm(true);
  };

  // إرسال النموذج (إضافة أو تعديل)
  // إرسال النموذج (إضافة أو تعديل)
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // بيانات بسيطة للاختبار
    const projectData = {
        name: formData.name,
        description: formData.description || '',
        budget: Number(formData.budget) || 0,
        status: formData.status || 'active',
        priority: formData.priority || 'medium',
        clientName: formData.clientName || '',
        clientEmail: formData.clientEmail || '',
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
    };
    
    console.log('🚀 إرسال المشروع:', projectData);
    
    try {
        setLoading(true);
        
        if (editingProject) {
            // تحديث مشروع موجود
            const response = await updateProject(editingProject._id, projectData);
            if (response.success) {
                toast.success('تم تحديث المشروع بنجاح');
            }
        } else {
            // إنشاء مشروع جديد
            const response = await createProject(projectData);
            if (response.success) {
                toast.success('تم إنشاء المشروع بنجاح');
            }
        }
        
        setShowForm(false);
        fetchProjects(); // إعادة جلب المشاريع
    } catch (err) {
        console.error('❌ خطأ في حفظ المشروع:', err);
        toast.error(editingProject ? 'فشل في تحديث المشروع' : 'فشل في إنشاء المشروع');
    } finally {
        setLoading(false);
    }
};

  // حذف مشروع
  const handleDelete = async (projectId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      return;
    }
    
    try {
      const response = await deleteProject(projectId);
      if (response.success) {
        toast.success('تم حذف المشروع بنجاح');
        fetchProjects(); // إعادة جلب المشاريع
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('فشل في حذف المشروع');
    }
  };

  // الحصول على لون الحالة
  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل' },
      'on-hold': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'معلق' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي' }
    };
    const statusInfo = statusMap[status] || statusMap['active'];
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  // الحصول على لون الأولوية
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'high': { bg: 'bg-red-100', text: 'text-red-800', label: 'عالية' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'متوسطة' },
      'low': { bg: 'bg-green-100', text: 'text-green-800', label: 'منخفضة' }
    };
    const priorityInfo = priorityMap[priority] || priorityMap['medium'];
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityInfo.bg} ${priorityInfo.text}`}>
        {priorityInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المشاريع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">المشاريع</h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة جميع المشاريع</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
        >
          <span className="text-xl">+</span>
          <span>مشروع جديد</span>
        </button>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">إجمالي المشاريع</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">مشاريع نشطة</div>
          <div className="text-3xl font-bold mt-2 text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">مشاريع مكتملة</div>
          <div className="text-3xl font-bold mt-2 text-blue-600">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">إجمالي الميزانية</div>
          <div className="text-3xl font-bold mt-2 text-purple-600">
            {stats.totalBudget.toLocaleString()} ريال
          </div>
        </div>
      </div>

      {/* نموذج إضافة/تعديل مشروع */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingProject ? 'تعديل المشروع' : 'مشروع جديد'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">اسم المشروع *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">الحالة</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="on-hold">معلق</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">الأولوية</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">الميزانية</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">اسم العميل</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">البريد الإلكتروني للعميل</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex-1"
                >
                  {editingProject ? 'تحديث المشروع' : 'إنشاء المشروع'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition flex-1"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 ابحث عن مشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="on-hold">معلق</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="name">حسب الاسم</option>
              <option value="budget">حسب الميزانية</option>
            </select>
          </div>
        </div>
      </div>

      {/* عرض الأخطاء */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* قائمة المشاريع */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد مشاريع</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'لا توجد مشاريع تطابق معايير البحث' 
              : 'قم بإضافة مشروع جديد للبدء'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              مسح التصفية
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              {/* رأس البطاقة */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">{project.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-white hover:text-blue-200 transition"
                      title="تعديل"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-white hover:text-red-200 transition"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {project.projectCode && (
                  <p className="text-blue-100 text-sm mt-1">📋 {project.projectCode}</p>
                )}
              </div>
              
              {/* محتوى البطاقة */}
              <div className="p-4">
                {project.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الحالة:</span>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الأولوية:</span>
                    {getPriorityBadge(project.priority)}
                  </div>
                  
                  {project.budget > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">الميزانية:</span>
                      <span className="font-semibold">{project.budget.toLocaleString()} ريال</span>
                    </div>
                  )}
                  
                  {project.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">التقدم:</span>
                        <span className="font-semibold">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* معلومات العميل */}
                {(project.clientName || project.clientEmail) && (
                  <div className="border-t pt-3 mt-3">
                    {project.clientName && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">العميل:</span> {project.clientName}
                      </p>
                    )}
                    {project.clientEmail && (
                      <p className="text-sm text-gray-600 truncate">
                        <span className="font-medium">البريد:</span> {project.clientEmail}
                      </p>
                    )}
                  </div>
                )}
                
                {/* تواريخ المشروع */}
                {(project.startDate || project.endDate) && (
                  <div className="border-t pt-3 mt-3 text-xs text-gray-400">
                    {project.startDate && (
                      <p>📅 البداية: {new Date(project.startDate).toLocaleDateString('ar-EG')}</p>
                    )}
                    {project.endDate && (
                      <p>⏰ النهاية: {new Date(project.endDate).toLocaleDateString('ar-EG')}</p>
                    )}
                  </div>
                )}
                
                {/* تاريخ الإنشاء */}
                <div className="border-t pt-2 mt-3 text-xs text-gray-400">
                  <p>🕒 أنشئ: {new Date(project.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;