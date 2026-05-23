import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { RotateCcw, Search, CheckSquare, Square, Sparkles, User, ChevronRight, Send } from 'lucide-react';
import MatchBadge from '../../components/MatchBadge';

export default function RejectionPool() {
  const { hr } = useApp();
  const [rejections, setRejections] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [reclaiming, setReclaiming] = useState(false);
  const [reclaimResults, setReclaimResults] = useState(null);
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    if (hr?.id) loadRejections();
  }, [hr]);

  const loadRejections = async () => {
    try {
      const params = {};
      if (filterSkill) params.skills = filterSkill;
      const data = await api.getRejections(hr.id, params);
      setRejections(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === rejections.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rejections.map(r => r.id)));
    }
  };

  const handleReclaim = async () => {
    if (selected.size === 0) return;
    setReclaiming(true);
    try {
      const results = await api.reclaimCandidates(Array.from(selected), hr.id);
      setReclaimResults(results);
    } catch (e) {
      alert('回捞匹配失败：' + e.message);
    } finally {
      setReclaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-primary-500" />候选人回捞池
        </h2>
        <p className="text-xs text-gray-500 mt-1">已拒绝候选人AI二次匹配回捞</p>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filterSkill}
            onChange={e => setFilterSkill(e.target.value)}
            placeholder="按技能搜索候选人..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Batch Actions */}
      {rejections.length > 0 && (
        <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100">
          <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-gray-600">
            {selected.size === rejections.length ? <CheckSquare className="w-4 h-4 text-primary-500" /> : <Square className="w-4 h-4" />}
            全选 ({selected.size}/{rejections.length})
          </button>
          <button
            onClick={handleReclaim}
            disabled={selected.size === 0 || reclaiming}
            className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {reclaiming ? 'AI匹配中...' : `AI回捞匹配 (${selected.size})`}
          </button>
        </div>
      )}

      {/* Rejection List */}
      <div className="px-4 py-3 space-y-2.5">
        {rejections.map((r, i) => (
          <div 
            key={i} 
            className={`bg-white rounded-xl p-4 shadow-sm border transition-colors cursor-pointer
              ${selected.has(r.id) ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100'}`}
            onClick={() => toggleSelect(r.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {selected.has(r.id) 
                  ? <CheckSquare className="w-5 h-5 text-primary-500" /> 
                  : <Square className="w-5 h-5 text-gray-300" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{r.user_name}</span>
                  <MatchBadge level={r.original_match_level} />
                </div>
                <p className="text-xs text-gray-500">{r.education} · {r.major}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(r.skills || '').split(',').slice(0, 3).map((s, j) => (
                    <span key={j} className="bg-primary-50 text-primary-500 text-[10px] px-1.5 py-0.5 rounded">{s.trim()}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <div className="text-xs text-gray-400">
                    原岗位：{r.original_job_title} · 匹配 {r.original_match_score}%
                  </div>
                  <span className="text-xs text-red-400">{r.reject_reason}</span>
                </div>

                {/* Reclaim results */}
                {r.reclaim_match && typeof r.reclaim_match === 'string' && (
                  <div className="mt-2 bg-green-50 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />AI回捞结果
                    </p>
                    {JSON.parse(r.reclaim_match).map((m, mi) => (
                      <div key={mi} className="flex items-center justify-between py-1">
                        <span className="text-xs text-gray-700">{m.job_title}</span>
                        <div className="flex items-center gap-2">
                          <MatchBadge level={m.match_level} />
                          <span className="text-xs font-bold text-green-600">{m.match_score}%</span>
                          <button className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded">
                            <Send className="w-2.5 h-2.5 inline" /> 邀约
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {rejections.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">暂无已拒绝候选人</p>
          </div>
        )}
      </div>

      {/* Reclaim Results Modal */}
      {reclaimResults && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setReclaimResults(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-500" />AI回捞匹配结果
            </h3>
            {reclaimResults.map((r, i) => (
              <div key={i} className="mb-4 bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900 mb-2">{r.user_name}</p>
                {r.matches.length > 0 ? r.matches.map((m, mi) => (
                  <div key={mi} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{m.job_title}</p>
                      <p className="text-[10px] text-gray-400">{m.reasons?.join('；')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MatchBadge level={m.match_level} />
                      <span className="text-sm font-bold text-green-500">{m.match_score}%</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400">暂无适配岗位</p>
                )}
              </div>
            ))}
            <button onClick={() => setReclaimResults(null)} className="btn-primary w-full text-sm">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
