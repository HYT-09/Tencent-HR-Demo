import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { UserCheck, CalendarCheck, XCircle, TrendingUp, Users, ChevronRight, Star, LogOut } from 'lucide-react';
import MatchBadge from '../../components/MatchBadge';

export default function HrDashboard() {
  const navigate = useNavigate();
  const { hr, logout } = useApp();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hr?.id) loadDashboard();
  }, [hr]);

  const loadDashboard = async () => {
    try {
      const data = await api.getHrDashboard(hr.id);
      setDashboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">加载中...</div>;
  }

  const { pending = 0, invited = 0, rejected = 0, highMatch = [], recentActivity = [] } = dashboard || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-400 px-4 pt-12 pb-6 relative">
        <button onClick={logout} className="absolute top-12 right-4 text-white/60 hover:text-white" title="退出登录">
          <LogOut className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">HR工作台</h2>
        <p className="text-sm text-white/70 mt-0.5">{hr?.name || 'HR'} · {hr?.department || ''}</p>
      </div>

      <div className="px-4 -mt-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { icon: UserCheck, label: '待处理', value: pending, color: 'bg-blue-50 text-blue-600', iconColor: 'text-blue-500' },
            { icon: CalendarCheck, label: '已邀约', value: invited, color: 'bg-green-50 text-green-600', iconColor: 'text-green-500' },
            { icon: XCircle, label: '已拒绝', value: rejected, color: 'bg-red-50 text-red-600', iconColor: 'text-red-500' },
          ].map((item, i) => (
            <div key={i} className={`${item.color} rounded-xl p-3.5 text-center`}>
              <item.icon className={`w-6 h-6 ${item.iconColor} mx-auto mb-1.5`} />
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-[10px] opacity-70">{item.label}</div>
            </div>
          ))}
        </div>

        {/* High Match Candidates */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary-500" />高匹配候选人
              <span className="text-xs text-primary-500 font-medium">A级以上</span>
            </h3>
            <button onClick={() => navigate('/hr/candidates')} className="text-xs text-primary-500 flex items-center">
              查看全部 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {highMatch.length > 0 ? highMatch.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 border-primary-500 card-hover">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{c.user_name}</span>
                      <MatchBadge level={c.match_level} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.education} · {c.major}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-500">{c.match_score}%</div>
                    <div className="text-[10px] text-gray-400">{c.job_title}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-primary-50 text-primary-500 text-xs font-medium py-2 rounded-lg">
                    发送邀约
                  </button>
                  <button className="flex-1 bg-gray-50 text-gray-600 text-xs font-medium py-2 rounded-lg">
                    查看简历
                  </button>
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                暂无高匹配候选人
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">最近动态</h3>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            {recentActivity.length > 0 ? recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium">{a.user_name}</span> 投递了 <span className="text-primary-500">{a.job_title}</span>
                  </p>
                  <p className="text-[10px] text-gray-400">{new Date(a.apply_time).toLocaleString()}</p>
                </div>
                <MatchBadge level={a.match_level} />
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400 text-sm">暂无动态</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
