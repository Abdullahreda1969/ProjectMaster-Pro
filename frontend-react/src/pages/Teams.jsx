import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/projectService';
import toast from 'react-hot-toast';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    leader: '',
    members: [],
    projectIds: [],
    projectNames: []
  });

  // ========== تعريف جميع الدوال أولاً ==========

  // تحميل المشاريع
  const loadProjects = async () => {
    try {
      const response = await getProjects();
      if (response.success) {
        setProjects(response.projects || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // تحميل الفرق من التخزين المحلي
  const loadTeamsFromStorage = () => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      // بيانات افتراضية
      const defaultTeams = [
        {
          id: 1,
          name: 'فريق التطوير',
          description: 'فريق مسؤول عن تطوير التطبيقات',
          department: 'تقنية المعلومات',
          leader: 'أحمد محمد',
          members: [
            { name: 'محمد علي', role: 'مطور' },
            { name: 'سارة أحمد', role: 'مطور' }
          ],
          projectIds: [],
          projectNames: [],
          createdAt: new Date().toISOString().split('T')[0]
        }
      ];
      setTeams(defaultTeams);
      localStorage.setItem('teams', JSON.stringify(defaultTeams));
    }
    setLoading(false);
  };

  // حفظ الفرق
  const saveTeams = (updatedTeams) => {
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
  };

  // ========== ثم استخدامها في useEffect ==========

  useEffect(() => {
    const loadData = async () => {
      await loadProjects();      // الآن آمن لأن الدالة معرفة قبله
      loadTeamsFromStorage();    // الآن آمن لأن الدالة معرفة قبله
    };
    loadData();
  }, []); // ✅ لا توجد دوال في الـ dependencies array

  // ========== باقي الدوال ==========

  // فتح نموذج الإضافة
  const handleAddNew = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      department: '',
      leader: '',
      members: [],
      projectIds: [],
      projectNames: []
    });
    setNewMember({ name: '', role: '' });
    setShowForm(true);
  };

  // فتح نموذج التعديل
  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
      description: team.description || '',
      department: team.department || '',
      leader: team.leader || '',
      members: team.members || [],
      projectIds: team.projectIds || [],
      projectNames: team.projectNames || []
    });
    setShowForm(true);
  };

  // حذف فريق
  const handleDelete = (teamId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفريق؟')) {
      const updated = teams.filter(t => t.id !== teamId);
      saveTeams(updated);
      toast.success('تم حذف الفريق');
    }
  };

  // إضافة عضو
  const handleAddMember = () => {
    if (newMember.name && newMember.role) {
      setFormData({
        ...formData,
        members: [...formData.members, { ...newMember }]
      });
      setNewMember({ name: '', role: '' });
    } else {
      toast.error('الرجاء إدخال اسم العضو ودوره');
    }
  };

  // حذف عضو
  const handleRemoveMember = (index) => {
    const updated = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: updated });
  };

  // اختيار مشروع
  const handleProjectSelect = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value);
    const selectedNames = selectedIds.map(id => {
      const project = projects.find(p => p._id === id);
      return project ? project.name : '';
    });
    
    setFormData({
      ...formData,
      projectIds: selectedIds,
      projectNames: selectedNames
    });
  };

  // إرسال النموذج
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('اسم الفريق مطلوب');
      return;
    }

    let updatedTeams;
    if (editingTeam) {
      updatedTeams = teams.map(t => 
        t.id === editingTeam.id ? { 
          ...t, 
          ...formData,
          updatedAt: new Date().toISOString().split('T')[0]
        } : t
      );
      toast.success('تم تحديث الفريق');
    } else {
      const newTeam = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updatedTeams = [...teams, newTeam];
      toast.success('تم إنشاء الفريق');
    }
    
    saveTeams(updatedTeams);
    setShowForm(false);
  };

  // إحصائيات
  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
  const totalProjects = teams.reduce((sum, t) => sum + (t.projectIds?.length || 0), 0);
  const departments = new Set(teams.map(t => t.department).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الفرق</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> فريق جديد
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">الفرق</div>
          <div className="text-3xl font-bold">{teams.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">الأعضاء</div>
          <div className="text-3xl font-bold text-blue-600">{totalMembers}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">المشاريع</div>
          <div className="text-3xl font-bold text-green-600">{totalProjects}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">الأقسام</div>
          <div className="text-3xl font-bold text-purple-600">{departments}</div>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTeam ? 'تعديل الفريق' : 'فريق جديد'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="اسم الفريق *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
              
              <textarea
                placeholder="الوصف"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border p-2 rounded"
                rows="3"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="القسم"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="border p-2 rounded"
                />
                
                <input
                  type="text"
                  placeholder="قائد الفريق"
                  value={formData.leader}
                  onChange={(e) => setFormData({...formData, leader: e.target.value})}
                  className="border p-2 rounded"
                />
              </div>

              {/* المشاريع */}
              <div>
                <label className="block mb-2">المشاريع</label>
                <select
                  multiple
                  value={formData.projectIds}
                  onChange={handleProjectSelect}
                  className="w-full border p-2 rounded h-32"
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* الأعضاء */}
              <div>
                <label className="block mb-2">الأعضاء ({formData.members.length})</label>
                
                {formData.members.map((m, i) => (
                  <div key={i} className="flex justify-between bg-gray-50 p-2 rounded mb-2">
                    <span>{m.name} - {m.role}</span>
                    <button type="button" onClick={() => handleRemoveMember(i)} className="text-red-600">✕</button>
                  </div>
                ))}
                
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="الاسم"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="flex-1 border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="الدور"
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    className="flex-1 border p-2 rounded"
                  />
                  <button type="button" onClick={handleAddMember} className="bg-green-600 text-white px-4 rounded">
                    إضافة
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded flex-1">
                  {editingTeam ? 'تحديث' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-6 py-2 rounded flex-1">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* بطاقات الفرق */}
      <div className="grid grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
              <div className="flex justify-between">
                <h3 className="font-bold">{team.name}</h3>
                <div>
                  <button onClick={() => handleEdit(team)} className="mr-2">✏️</button>
                  <button onClick={() => handleDelete(team.id)}>🗑️</button>
                </div>
              </div>
              <p className="text-sm text-purple-200">{team.department}</p>
            </div>
            
            <div className="p-4">
              {team.leader && (
                <div className="bg-yellow-50 p-2 rounded mb-3">
                  <span className="font-medium">👑 {team.leader}</span>
                </div>
              )}
              
              <div className="mb-3">
                <div className="text-sm text-gray-500 mb-1">الأعضاء ({team.members.length})</div>
                {team.members.map((m, i) => (
                  <div key={i} className="text-sm bg-gray-50 p-1 rounded mb-1">
                    {m.name} - {m.role}
                  </div>
                ))}
              </div>
              
              {team.projectNames?.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">المشاريع</div>
                  <div className="flex flex-wrap gap-1">
                    {team.projectNames.map((p, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;