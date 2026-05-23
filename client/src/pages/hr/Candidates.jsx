import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { Search, Filter, Send, XCircle, Eye, User, ChevronDown } from 'lucide-react';
import MatchBadge, { StatusBadge } from '../../components/MatchBadge';

export default function HrCandidates() {
  const { hr } = useApp();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteForm, setInviteForm] = useState({ interview_time: '', interview_location: '', interview_type: '现场', interview_notes: '' });

  useEffect(() => {
    if (hr?.id) loadCandidates();
  }, [hr, statusFilter]);

  const loadCandidates = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await api.getCandidates(hr.id, params);
      setCandidates(data.candidates || []);
      setStats(data.stats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedCandidate) return;
    try {
      await api.sendInvite({
        application_id: selectedCandidate.id,
        ...inviteForm
      });
      setShowInviteModal(false);
      loadCandidates();
      alert('邀约发送成功！');
    } catch (e) {
      alert('发送失败：' + e.message);
    }
  };

  const handleReject = async (app) => {
    if (!confirm(`确定拒绝 ${app.user_name} 的投递？`)) return;
    try {
      await api.markResult({
        application_id: app.id,
        status: 'rejected',
        reject_reason: '岗位匹配度不足',
        hr_id: hr.id
      });
      loadCandidates();
    } catch (e) {
      alert('操作失败');
    }
  };

  const statCounts = { applied: 0, invited: 0, interviewed: 0, rejected: 0 };
  stats.forEach(s => { statCounts[s.status] = s.count; });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-4">
        <h2 className="text-xl font-bold text-gray-900">候选人管理</h2>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[
            { key: '', label: '全部' },
            { key: 'applied', label: `待处理 (${statCounts.applied})` },
            { key: 'invited', label: `已邀约 (${statCounts.invited})` },
            { key: 'rejected', label: `已拒绝 (${statCounts.rejected})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                ${statusFilter === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        {candidates.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{c.user_name}</span>
                    <MatchBadge level={c.match_level} />
                  </div>
                  <p className="text-xs text-gray-500">{c.education} · {c.major}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-500">{c.match_score}%</div>
                <StatusBadge status={c.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {(c.skills || '').split(',').slice(0, 3).map((s, j) => (
                <span key={j} className="bg-primary-50 text-primary-500 text-[10px] px-2 py-0.5 rounded">{s.trim()}</span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>投递岗位：{c.job_title}</span>
              <span>{new Date(c.apply_time).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              {c.status === 'applied' && (
                <>
                  <button
                    onClick={() => { setSelectedCandidate(c); setShowInviteModal(true); }}
                    className="flex-1 bg-primary-500 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />发送邀约
                  </button>
                  <button
                    onClick={() => handleReject(c)}
                    className="flex-1 bg-red-50 text-red-500 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />拒绝
                  </button>
                </>
              )}
              {c.status === 'invited' && (
                <button className="flex-1 bg-green-50 text-green-600 text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" />查看详情
                </button>
              )}
            </div>
          </div>
        ))}

        {candidates.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">暂无候选人数据</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">发送面试邀约</h3>
            <p className="text-sm text-gray-500 mb-4">候选人：{selectedCandidate?.user_name} - {selectedCandidate?.job_title}</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">面试时间</label>
                <input
                  type="datetime-local"
                  value={inviteForm.interview_time}
                  onChange={e => setInviteForm({...inviteForm, interview_time: e.target.value})}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">面试地点</label>
                <input
                  type="text"
                  value={inviteForm.interview_location}
                  onChange={e => setInviteForm({...inviteForm, interview_location: e.target.value})}
                  placeholder="如：深圳腾讯滨海大厦"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">面试形式</label>
                <div className="flex gap-2">
                  {['现场', '视频', '电话'].map(t => (
                    <button
                      key={t}
                      onClick={() => setInviteForm({...inviteForm, interview_type: t})}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium
                        ${inviteForm.interview_type === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">备注</label>
                <textarea
                  value={inviteForm.interview_notes}
                  onChange={e => setInviteForm({...inviteForm, interview_notes: e.target.value})}
                  placeholder="面试注意事项等"
                  rows="2"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInviteModal(false)} className="btn-outline flex-1 text-sm">取消</button>
              <button onClick={handleInvite} className="btn-primary flex-1 text-sm">确认发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
