import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { ClipboardList, Send, CalendarCheck, XCircle, ChevronRight, Info } from 'lucide-react';
import { StatusBadge } from '../../components/MatchBadge';

const STATUS_TABS = [
  { key: 'all', label: '全部', icon: ClipboardList },
  { key: 'applied', label: '已投递', icon: Send },
  { key: 'invited', label: '已获邀', icon: CalendarCheck },
  { key: 'rejected', label: '已拒绝', icon: XCircle },
];

export default function JobProgress() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState({ summary: {}, applications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await api.getProgress(user.id);
      setData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeTab === 'all' 
    ? data.applications 
    : data.applications.filter(a => a.status === activeTab);

  const summary = data.summary || {};
  const counts = {
    all: summary.total || 0,
    applied: summary.applied || 0,
    invited: summary.invited || 0,
    rejected: summary.rejected || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4">
        <h2 className="text-xl font-bold text-gray-900">求职进度看板</h2>
        <p className="text-xs text-gray-500 mt-1">实时追踪所有投递岗位进度</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-primary-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-primary-500">{counts.applied}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">已投递</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{counts.invited}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">已获邀</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{counts.rejected}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">已拒绝</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors
              ${activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Application List */}
      <div className="px-4 pb-8 space-y-2.5">
        {filtered.map((app, i) => (
          <div key={app.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{app.job_title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{app.department} · {app.city}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-1 my-3">
              {['applied', 'invited', 'interviewed', 'offered'].map((s, si) => {
                const statusOrder = { applied: 0, invited: 1, interviewed: 2, offered: 3, rejected: -1 };
                const isDone = statusOrder[app.status] >= si;
                const isCurrent = app.status === s;
                return (
                  <React.Fragment key={s}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px]
                      ${isDone ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}
                      ${isCurrent ? 'ring-2 ring-primary-200' : ''}`}
                    >
                      {isDone ? '✓' : si + 1}
                    </div>
                    {si < 3 && <div className={`flex-1 h-0.5 ${isDone ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Details based on status */}
            {app.status === 'invited' && app.interview_time && (
              <div className="bg-green-50 rounded-lg p-3 text-xs">
                <p className="font-semibold text-green-700 mb-1">面试邀约</p>
                <p className="text-green-600">时间：{app.interview_time}</p>
                {app.interview_location && <p className="text-green-600">地点：{app.interview_location}</p>}
                {app.interview_type && <p className="text-green-600">形式：{app.interview_type}</p>}
              </div>
            )}

            {app.status === 'rejected' && (
              <div className="bg-red-50 rounded-lg p-2.5 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <span className="text-xs text-red-600">
                  {app.reject_reason || '您的简历与该岗位匹配度相对较低，暂不适合该岗位'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
              <span className="text-[10px] text-gray-400">投递时间：{new Date(app.apply_time).toLocaleDateString()}</span>
              {app.match_score && <span className="text-xs font-semibold text-primary-500">匹配度 {app.match_score}%</span>}
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">暂无投递记录</p>
            <button onClick={() => navigate('/upload')} className="btn-primary mt-4 text-sm">去投递</button>
          </div>
        )}
      </div>
    </div>
  );
}
