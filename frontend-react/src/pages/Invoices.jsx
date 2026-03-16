/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../services/invoiceService';
import { getProjects } from '../services/projectService';
import toast from 'react-hot-toast';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // حالة النموذج
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        projectId: '',
        projectName: '',
        amount: '',
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: ''
    });

    // جلب البيانات عند تحميل الصفحة
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [invoicesRes, projectsRes] = await Promise.all([
                getInvoices(),
                getProjects()
            ]);
            
            if (invoicesRes.success) {
                setInvoices(invoicesRes.invoices || []);
            }
            
            if (projectsRes.success) {
                setProjects(projectsRes.projects || []);
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('فشل في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    // تصفية الفواتير
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = 
            invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // إحصائيات سريعة
    const stats = {
        total: invoices.length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        pending: invoices.filter(inv => inv.status === 'pending' || inv.status === 'sent').length,
        draft: invoices.filter(inv => inv.status === 'draft').length,
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0)
    };

    // فتح نموذج الإضافة
    const handleAddNew = () => {
        setEditingInvoice(null);
        setFormData({
            clientName: '',
            clientEmail: '',
            projectId: '',
            projectName: '',
            amount: '',
            status: 'draft',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            notes: ''
        });
        setShowForm(true);
    };

    // فتح نموذج التعديل
    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setFormData({
            clientName: invoice.clientName || '',
            clientEmail: invoice.clientEmail || '',
            projectId: invoice.projectId || '',
            projectName: invoice.projectName || '',
            amount: invoice.amount || '',
            status: invoice.status || 'draft',
            issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
            notes: invoice.notes || ''
        });
        setShowForm(true);
    };

    // حذف فاتورة
    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
        
        try {
            const response = await deleteInvoice(id);
            if (response.success) {
                toast.success('تم حذف الفاتورة بنجاح');
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('فشل في حذف الفاتورة');
        }
    };

    // تغيير حالة الفاتورة
    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await updateInvoice(id, { status: newStatus });
            if (response.success) {
                toast.success('تم تحديث الحالة');
                fetchData();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('فشل في تحديث الحالة');
        }
    };

    // إرسال النموذج
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // التحقق من البيانات المطلوبة
        if (!formData.clientName || !formData.amount || !formData.dueDate) {
            toast.error('الرجاء إدخال البيانات المطلوبة');
            return;
        }
        
        // تجهيز البيانات للإرسال
        const invoiceData = {
            clientName: formData.clientName,
            clientEmail: formData.clientEmail || '',
            clientPhone: formData.clientPhone || '',
            projectId: formData.projectId || null, // إذا كان فارغاً أرسل null
            projectName: formData.projectName || '',
            amount: Number(formData.amount),
            status: formData.status || 'draft',
            issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
            dueDate: formData.dueDate,
            notes: formData.notes || ''
        };
        
        console.log('📤 إرسال بيانات الفاتورة:', invoiceData);
        
        try {
            let response;
            
            if (editingInvoice) {
                response = await updateInvoice(editingInvoice._id, invoiceData);
                if (response.success) toast.success('تم تحديث الفاتورة');
            } else {
                response = await createInvoice(invoiceData);
                if (response.success) toast.success('تم إنشاء الفاتورة');
            }
            
            if (response?.success) {
                setShowForm(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast.error(editingInvoice ? 'فشل في التحديث' : 'فشل في الإنشاء');
        }
    };
    // تنسيق العملة
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount || 0);
    };

    // تنسيق التاريخ
    const formatDate = (dateString) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('ar-EG');
    };

    // الحصول على شارة الحالة
    const getStatusBadge = (status) => {
        const statusMap = {
            'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'مدفوعة' },
            'sent': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مرسلة' },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد الانتظار' },
            'overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'متأخرة' },
            'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة' },
            'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ملغية' }
        };
        const info = statusMap[status] || statusMap['draft'];
        
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${info.bg} ${info.text}`}>
                {info.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل الفواتير...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6" dir="rtl">
            {/* رأس الصفحة */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">الفواتير</h1>
                    <p className="text-gray-600 mt-1">إدارة الفواتير والمدفوعات</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
                >
                    <span className="text-xl">+</span>
                    <span>فاتورة جديدة</span>
                </button>
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">إجمالي الفواتير</div>
                    <div className="text-3xl font-bold mt-2">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">مدفوعة</div>
                    <div className="text-3xl font-bold mt-2 text-green-600">{stats.paid}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">قيد الانتظار</div>
                    <div className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">مسودة</div>
                    <div className="text-3xl font-bold mt-2 text-gray-600">{stats.draft}</div>
                </div>
            </div>

            {/* بطاقة المبالغ */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 mb-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-blue-100 mb-1">إجمالي المبالغ</div>
                        <div className="text-3xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                    </div>
                    <div>
                        <div className="text-blue-100 mb-1">المبالغ المدفوعة</div>
                        <div className="text-3xl font-bold">{formatCurrency(stats.paidAmount)}</div>
                    </div>
                </div>
                <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
                    <div 
                        className="bg-green-400 h-2 rounded-full" 
                        style={{ width: `${stats.totalAmount ? (stats.paidAmount / stats.totalAmount) * 100 : 0}%` }}
                    ></div>
                </div>
            </div>

            {/* نموذج إضافة/تعديل */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingInvoice ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                        اسم العميل <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={formData.clientEmail}
                                        onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">المشروع</label>
                                    <select
                                        value={formData.projectId}
                                        onChange={(e) => {
                                            const project = projects.find(p => p._id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                projectId: e.target.value,
                                                projectName: project?.name || ''
                                            });
                                        }}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="">اختر مشروعاً</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        المبلغ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">تاريخ الإصدار</label>
                                    <input
                                        type="date"
                                        value={formData.issueDate}
                                        onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        تاريخ الاستحقاق <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">الحالة</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="draft">مسودة</option>
                                        <option value="sent">مرسلة</option>
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="paid">مدفوعة</option>
                                        <option value="cancelled">ملغية</option>
                                    </select>
                                </div>
                                
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">ملاحظات</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        rows="3"
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex-1">
                                    {editingInvoice ? 'تحديث' : 'إنشاء'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition flex-1">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* شريط البحث والتصفية */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="🔍 ابحث برقم الفاتورة أو اسم العميل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>
                    
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="paid">مدفوعة</option>
                            <option value="sent">مرسلة</option>
                            <option value="pending">قيد الانتظار</option>
                            <option value="overdue">متأخرة</option>
                            <option value="draft">مسودة</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* جدول الفواتير */}
            {filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد فواتير</h3>
                    <p className="text-gray-500">
                        {searchTerm || statusFilter !== 'all' 
                            ? 'لا توجد نتائج تطابق بحثك' 
                            : 'قم بإضافة فاتورة جديدة للبدء'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">رقم الفاتورة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">العميل</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المشروع</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">تاريخ الاستحقاق</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">المبلغ</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الحالة</th>
                                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredInvoices.map((invoice) => {
                                const isOverdue = invoice.status !== 'paid' && 
                                                 new Date(invoice.dueDate) < new Date();
                                
                                return (
                                    <tr key={invoice._id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                                        <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4">{invoice.clientName}</td>
                                        <td className="px-6 py-4">{invoice.projectName || '---'}</td>
                                        <td className="px-6 py-4">
                                            {formatDate(invoice.dueDate)}
                                            {isOverdue && <span className="mr-2 text-xs text-red-600">(متأخرة)</span>}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(invoice.amount)}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={invoice.status}
                                                onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                                                className="px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer"
                                            >
                                                <option value="draft">مسودة</option>
                                                <option value="sent">مرسلة</option>
                                                <option value="pending">قيد الانتظار</option>
                                                <option value="paid">مدفوعة</option>
                                                <option value="cancelled">ملغية</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(invoice)} className="text-blue-600 hover:text-blue-800" title="تعديل">✏️</button>
                                                <button onClick={() => handleDelete(invoice._id)} className="text-red-600 hover:text-red-800" title="حذف">🗑️</button>
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

export default Invoices;