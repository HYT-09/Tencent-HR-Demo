import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Upload, BarChart3, User, Briefcase, Users, RotateCcw, Settings } from 'lucide-react';
import { useApp } from '../hooks/useApp';

const userTabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/upload', icon: Upload, label: '上传简历' },
  { path: '/progress', icon: BarChart3, label: '求职进度' },
  { path: '/center', icon: User, label: '个人中心' }
];

const hrTabs = [
  { path: '/hr', icon: Briefcase, label: '工作台' },
  { path: '/hr/candidates', icon: Users, label: '候选人' },
  { path: '/hr/rejections', icon: RotateCcw, label: '回捞池' }
];

export default function Layout({ type = 'user' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hr } = useApp();
  const tabs = type === 'hr' ? hrTabs : type === 'admin' ? [] : userTabs;

  // 检查登录状态
  React.useEffect(() => {
    if (type === 'user' && !user) navigate('/login');
    if (type === 'hr' && !hr) navigate('/hr/login');
  }, [type, user, hr]);

  if (type === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">腾讯校招后台管理</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>运营管理员</span>
              <a href="/" className="text-primary-500 hover:underline">前往用户端</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    );
  }

  const currentPath = location.pathname;

  return (
    <div className="page-container max-w-lg mx-auto bg-white min-h-screen relative shadow-xl">
      {/* iOS Status Bar Simulation */}
      <div className="safe-top bg-white" />
      
      {/* Content */}
      <main className="overflow-y-auto" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <Outlet />
      </main>

      {/* Tab Bar */}
      {tabs.length > 0 && (
        <nav className="tab-bar h-16">
          {tabs.map(tab => {
            const isActive = currentPath === tab.path || 
              (tab.path !== '/' && currentPath.startsWith(tab.path));
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors
                  ${isActive ? 'text-primary-500' : 'text-gray-400'}`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
