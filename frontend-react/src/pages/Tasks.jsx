import React, { useState, useEffect } from 'react';
import { 
    getTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    getTaskStats 
} from '../services/taskService';
import { getProjects } from '../services/projectService';
import toast from 'react-hot-toast';

const Tasks = () => {
    // حالات المهام
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        highPriority: 0,
        overdue: 0
    });

    // حالات النموذج
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        projectId: '',
        projectName: '',
        assignee: '',
        dueDate: '',
        estimatedHours: ''
    });

    // حالات التصفية
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterProject, setFilterProject] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // جلب البيانات عند تحميل الصفحة
    useEffect(() => {
        fetchData();
    }, []);

    // تحديث المهام المفلترة
    useEffect(() => {
        filterTasks();
    }, [tasks, filterStatus, filterPriority, filterProject, searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // جلب المهام والمشاريع والإحصائيات معاً
            const [tasksRes, projectsRes, statsRes] = await Promise.all([
                getTasks(),
                getProjects(),
                getTaskStats()
            ]);
            
            if (tasksRes.success) {
                setTasks(tasksRes.tasks);
                setFilteredTasks(tasksRes.tasks);
            }
            
            if (projectsRes.success) {
                setProjects(projectsRes.projects);
            }
            
            if (statsRes.success) {
                setStats(statsRes.stats);
            }
            
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('فشل في تحميل البيانات');
            toast.error('فشل في تحميل المهام');
        } finally {
            setLoading(false);
        }
    };

    // تصفية المهام
    const filterTasks = () => {
        let filtered = [...tasks];

        // تصفية حسب الحالة
        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        // تصفية حسب الأولوية
        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority);
        }

        // تصفية حسب المشروع
        if (filterProject !== 'all') {
            filtered = filtered.filter(task => task.projectId === filterProject);
        }

        // بحث في العنوان والوصف
        if (searchTerm) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (task.taskCode && task.taskCode.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredTasks(filtered);
    };

    // التعامل مع تغيير المدخلات
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // إذا تم اختيار مشروع، قم بتعبئة اسم المشروع تلقائياً
        if (name === 'projectId') {
            const selectedProject = projects.find(p => p._id === value);
            if (selectedProject) {
                setFormData(prev => ({
                    ...prev,
                    projectName: selectedProject.name
                }));
            }
        }
    };

    // فتح نموذج الإضافة
    const handleAddNew = () => {
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            status: 'pending',
            priority: 'medium',
            projectId: '',
            projectName: '',
            assignee: '',
            dueDate: '',
            estimatedHours: ''
        });
        setShowForm(true);
    };

    // فتح نموذج التعديل
    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            projectId: task.projectId || '',
            projectName: task.projectName || '',
            assignee: task.assignee || '',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            estimatedHours: task.estimatedHours || ''
        });
        setShowForm(true);
    };

    // إرسال النموذج (إضافة أو تعديل)
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من العنوان
    if (!formData.title || formData.title.trim() === '') {
        toast.error('عنوان المهمة مطلوب');
        return;
    }
    
    // تجهيز البيانات للإرسال
    const taskData = {
        title: formData.title.trim(),
        description: formData.description || '',
        status: formData.status || 'pending',
        priority: formData.priority || 'medium',
        projectId: formData.projectId || null,
        projectName: formData.projectName || '',
        assignee: formData.assignee || '',
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0
    };
    
    console.log('🚀 إرسال المهمة:', taskData);
    
    try {
        setLoading(true);
        
        if (editingTask) {
            const response = await updateTask(editingTask._id, taskData);
            if (response.success) {
                toast.success('تم تحديث المهمة بنجاح');
            }
        } else {
            const response = await createTask(taskData);
            if (response.success) {
                toast.success('تم إنشاء المهمة بنجاح');
            }
        }
        
        setShowForm(false);
        fetchData();
    } catch (err) {
        console.error('❌ خطأ في حفظ المهمة:', err);
        
        // عرض رسالة خطأ مناسبة
        if (err.response?.data?.message) {
            toast.error(err.response.data.message);
        } else {
            toast.error(editingTask ? 'فشل في تحديث المهمة' : 'فشل في إنشاء المهمة');
        }
    } finally {
        setLoading(false);
    }
};

    // حذف مهمة
    const handleDelete = async (taskId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            return;
        }
        
        try {
            const response = await deleteTask(taskId);
            if (response.success) {
                toast.success('تم حذف المهمة بنجاح');
                fetchData(); // إعادة جلب البيانات
            }
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('فشل في حذف المهمة');
        }
    };

    // تحديث حالة المهمة
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await updateTask(taskId, { status: newStatus });
            if (response.success) {
                toast.success('تم تحديث حالة المهمة');
                fetchData();
            }
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('فشل في تحديث الحالة');
        }
    };

    // الحصول على لون الحالة
    const getStatusBadge = (status) => {
        const statusMap = {
            'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'مكتمل' },
            'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قيد التنفيذ' },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'في الانتظار' }
        };
        const statusInfo = statusMap[status] || statusMap['pending'];
        
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

    // التحقق من تأخر المهمة
    const isOverdue = (dueDate, status) => {
        if (status === 'completed') return false;
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل المهام...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6" dir="rtl">
            {/* رأس الصفحة */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">المهام</h1>
                    <p className="text-gray-600 mt-1">إدارة ومتابعة جميع المهام</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
                >
                    <span className="text-xl">+</span>
                    <span>مهمة جديدة</span>
                </button>
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-gray-500 text-sm">إجمالي المهام</div>
                    <div className="text-2xl font-bold mt-1">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-gray-500 text-sm">مكتملة</div>
                    <div className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-gray-500 text-sm">قيد التنفيذ</div>
                    <div className="text-2xl font-bold mt-1 text-blue-600">{stats.inProgress}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-gray-500 text-sm">في الانتظار</div>
                    <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-gray-500 text-sm">عالية الأولوية</div>
                    <div className="text-2xl font-bold mt-1 text-red-600">{stats.highPriority}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-gray-500 text-sm">متأخرة</div>
                    <div className="text-2xl font-bold mt-1 text-red-600">{stats.overdue}</div>
                </div>
            </div>

            {/* نموذج إضافة/تعديل مهمة */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingTask ? 'تعديل المهمة' : 'مهمة جديدة'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">عنوان المهمة *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">المشروع</label>
                                    <select
                                        name="projectId"
                                        value={formData.projectId}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">اختر مشروعاً</option>
                                        {projects.map(project => (
                                            <option key={project._id} value={project._id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">المسؤول</label>
                                    <input
                                        type="text"
                                        name="assignee"
                                        value={formData.assignee}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="اسم المسؤول"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">الحالة</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">في الانتظار</option>
                                        <option value="in-progress">قيد التنفيذ</option>
                                        <option value="completed">مكتمل</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">الأولوية</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">منخفضة</option>
                                        <option value="medium">متوسطة</option>
                                        <option value="high">عالية</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">الساعات المتوقعة</label>
                                    <input
                                        type="number"
                                        name="estimatedHours"
                                        value={formData.estimatedHours}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="ساعة"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex-1"
                                >
                                    {editingTask ? 'تحديث المهمة' : 'إنشاء المهمة'}
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

            {/* شريط التصفية والبحث */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="🔍 ابحث عن مهمة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="pending">في الانتظار</option>
                            <option value="in-progress">قيد التنفيذ</option>
                            <option value="completed">مكتمل</option>
                        </select>
                    </div>
                    
                    <div>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">جميع الأولويات</option>
                            <option value="high">عالية</option>
                            <option value="medium">متوسطة</option>
                            <option value="low">منخفضة</option>
                        </select>
                    </div>
                    
                    <div>
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">جميع المشاريع</option>
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
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

            {/* قائمة المهام */}
            {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد مهام</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all'
                            ? 'لا توجد مهام تطابق معايير البحث'
                            : 'قم بإضافة مهمة جديدة للبدء'}
                    </p>
                    {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterPriority('all');
                                setFilterProject('all');
                            }}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            مسح التصفية
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الكود</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المهمة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المشروع</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المسؤول</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ الاستحقاق</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الأولوية</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTasks.map((task) => {
                                const status = getStatusBadge(task.status);
                                const priority = getPriorityBadge(task.priority);
                                const overdue = isOverdue(task.dueDate, task.status);
                                
                                return (
                                    <tr key={task._id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {task.taskCode || '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{task.title}</div>
                                            {task.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {task.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {task.projectName || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {task.assignee || '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.dueDate ? (
                                                <div>
                                                    <div>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</div>
                                                    {overdue && (
                                                        <div className="text-xs text-red-600 font-medium">متأخرة</div>
                                                    )}
                                                </div>
                                            ) : '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${priority.bg} ${priority.text}`}>
                                                {priority.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${status.bg} ${status.text}`}
                                            >
                                                <option value="pending">في الانتظار</option>
                                                <option value="in-progress">قيد التنفيذ</option>
                                                <option value="completed">مكتمل</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEdit(task)}
                                                    className="text-blue-600 hover:text-blue-800 transition"
                                                    title="تعديل"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(task._id)}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                    title="حذف"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Tasks;