import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { Upload, TrendingUp, Briefcase, MapPin, ChevronRight, Bell, Star, Users, FileText } from 'lucide-react';
import { JobListItem } from '../../components/JobCard';

export default function UserHome() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ active: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, statsData] = await Promise.all([
        api.getJobs({ limit: 5 }),
        api.getJobStats()
      ]);
      setJobs(jobsData.jobs || []);
      setStats(statsData);
    } catch (e) {
      console.error('加载数据失败:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white min-h-screen">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.name ? `${user.name}，你好` : '你好'} 👋
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">发现最适合你的腾讯校招岗位</p>
          </div>
          <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main CTA Card */}
      <div className="px-4 mb-5">
        <div 
          onClick={() => navigate('/upload')}
          className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-6 shadow-xl shadow-primary-500/25 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="text-center text-white">
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <h3 className="text-xl font-bold mb-1">上传简历 智能匹配岗位</h3>
            <p className="text-sm opacity-80 mb-4">AI智能分析，精准匹配腾讯在招岗位</p>
            <button className="bg-white text-primary-500 font-semibold px-8 py-3 rounded-full text-sm shadow-md">
              立即上传简历
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Briefcase, label: '在招岗位', value: stats.active || '2,847', color: 'text-primary-500' },
            { icon: Users, label: '今日投递', value: '1,234', color: 'text-green-500' },
            { icon: Star, label: '高匹配率', value: '89%', color: 'text-orange-500' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-50 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1.5`} />
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Jobs */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-primary-500" />热门在招岗位
          </h3>
          <button 
            onClick={() => navigate('/upload')}
            className="text-xs text-primary-500 font-medium flex items-center"
          >
            查看全部 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="space-y-2.5">
          {jobs.map((job, i) => (
            <JobListItem 
              key={job.id} 
              job={job} 
              onClick={() => navigate(`/apply/${job.id}`)}
            />
          ))}
        </div>

        {jobs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">暂无岗位数据</p>
            <p className="text-xs mt-1">请先启动后端服务</p>
          </div>
        )}
      </div>

      {/* Quick Guide */}
      <div className="px-4 mt-6 pb-8">
        <h3 className="font-bold text-gray-900 mb-3">新手指南</h3>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          {[
            { step: '1', text: '上传简历（拍照/文件）', icon: '📄' },
            { step: '2', text: 'AI自动解析与匹配', icon: '🤖' },
            { step: '3', text: '查看推荐岗位并投递', icon: '🎯' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
