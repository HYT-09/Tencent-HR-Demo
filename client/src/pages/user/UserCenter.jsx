import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { User, FileText, BarChart3, Settings, HelpCircle, LogOut, ChevronRight, Upload, Trash2, Edit3 } from 'lucide-react';

export default function UserCenter() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteResume = async () => {
    if (!confirm('确定要删除简历吗？')) return;
    try {
      await api.updateUser(user.id, { education: null, major: null, skills: null, experience: null });
      await refreshUser();
    } catch (e) {
      alert('删除失败');
    }
  };

  const menuItems = [
    { icon: Upload, label: '上传新简历', desc: '重新上传简历进行匹配', action: () => navigate('/upload'), color: 'text-primary-500' },
    { icon: BarChart3, label: '求职进度', desc: '查看所有投递状态', action: () => navigate('/progress'), color: 'text-green-500' },
    { icon: Edit3, label: '编辑简历信息', desc: '修改已解析的简历内容', action: () => {}, color: 'text-orange-500' },
    { icon: Trash2, label: '删除简历', desc: '清除已上传的简历数据', action: handleDeleteResume, color: 'text-red-500' },
    { icon: Settings, label: '账户设置', desc: '修改个人信息', action: () => {}, color: 'text-gray-500' },
    { icon: HelpCircle, label: '帮助中心', desc: '新手教程与常见问题', action: () => {}, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-400 px-4 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user?.name || '未登录'}</h2>
            <p className="text-sm text-white/70">{user?.phone || ''}</p>
          </div>
          <button onClick={handleLogout} className="text-white/60 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Resume Status */}
        {user?.education && (
          <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <FileText className="w-3.5 h-3.5" />
              <span>简历已上传 · {user.education} · {user.major}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(user.skills || '').split(',').slice(0, 4).map((s, i) => (
                <span key={i} className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="text-center mt-8 pb-8">
        <p className="text-xs text-gray-300">腾讯校招求职平台 v1.0.0</p>
      </div>
    </div>
  );
}
