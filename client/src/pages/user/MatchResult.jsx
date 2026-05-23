import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { Target, Loader2, RefreshCw, GraduationCap, BookOpen, Wrench, Briefcase } from 'lucide-react';
import JobCard from '../../components/JobCard';

export default function MatchResult() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    if (user?.id) loadMatches();
  }, [user]);

  const loadMatches = async () => {
    try {
      const data = await api.matchJobs(user.id);
      setResults(data);
    } catch (e) {
      console.error('匹配失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user?.id || applying) return;
    setApplying(jobId);
    try {
      await api.applyJob(user.id, jobId);
      alert('投递成功！您可在求职进度中查看状态');
    } catch (e) {
      alert(e.message || '投递失败');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
        <p className="text-sm text-gray-500">正在为您智能匹配岗位...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />AI匹配结果
        </h2>
        <p className="text-xs text-gray-500 mt-1">基于您的简历为您推荐的最佳岗位</p>
      </div>

      {/* Resume Summary */}
      <div className="px-4 py-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">简历信息概览</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: GraduationCap, label: '学历', value: user?.education || '硕士', color: 'text-primary-500' },
              { icon: BookOpen, label: '专业', value: user?.major || '计算机科学与技术', color: 'text-green-500' },
              { icon: Wrench, label: '技能', value: (user?.skills || 'Python, ML, DL').split(',').slice(0, 2).join(', '), color: 'text-orange-500' },
              { icon: Briefcase, label: '经历', value: '2段实习', color: 'text-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <item.icon className={`w-4 h-4 ${item.color} mt-0.5 shrink-0`} />
                <div>
                  <div className="text-[10px] text-gray-400">{item.label}</div>
                  <div className="text-xs text-gray-700 font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Weight Visual */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 mb-2">匹配权重分布</p>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
              <div className="bg-primary-500 flex-[30]" title="学历30%" />
              <div className="bg-green-500 flex-[20]" title="专业20%" />
              <div className="bg-orange-500 flex-[30]" title="技能30%" />
              <div className="bg-purple-500 flex-[20]" title="经历20%" />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-gray-400">
              <span>学历30%</span><span>专业20%</span><span>技能30%</span><span>经历20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Results */}
      <div className="px-4 pb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900">推荐岗位 ({results.length})</h3>
          <button onClick={loadMatches} className="text-xs text-primary-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />重新匹配
          </button>
        </div>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result, i) => (
              <div key={i} className={i === 0 ? 'ring-2 ring-primary-500/30 rounded-2xl' : ''}>
                {i === 0 && (
                  <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-t-xl text-center">
                    🏆 最佳匹配
                  </div>
                )}
                <JobCard
                  job={result.job}
                  matchScore={result.match_score}
                  matchLevel={result.match_level}
                  reasons={result.reasons}
                  onApply={() => handleApply(result.job.id)}
                  onSave={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">暂无匹配岗位</p>
            <button onClick={() => navigate('/upload')} className="btn-outline mt-4 text-sm">上传简历</button>
          </div>
        )}
      </div>
    </div>
  );
}
