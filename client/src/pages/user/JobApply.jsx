import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useApp } from '../../hooks/useApp';
import { MapPin, Building2, GraduationCap, BookOpen, Wrench, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import MatchBadge from '../../components/MatchBadge';

export default function JobApply() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const data = await api.getJob(jobId);
      setJob(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user?.id) { navigate('/login'); return; }
    setApplying(true);
    try {
      await api.applyJob(user.id, jobId);
      setApplied(true);
      setShowModal(true);
    } catch (e) {
      alert(e.message || '投递失败');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">加载中...</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">岗位不存在</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-50 to-white px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          ← 返回
        </button>
        <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.department}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.city}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-2xl font-bold text-primary-500">{job.salary_range}</span>
          <span className="text-xs text-gray-400">/月</span>
        </div>
      </div>

      {/* Requirements */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <GraduationCap className="w-3.5 h-3.5" />学历要求
            </div>
            <span className="text-sm font-medium text-gray-700">{job.education_req || '不限'}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <BookOpen className="w-3.5 h-3.5" />专业要求
            </div>
            <span className="text-sm font-medium text-gray-700">{job.major_req || '不限'}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills_req && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
              <Wrench className="w-4 h-4 text-primary-500" />技能要求
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills_req.split(/[,，、]/).map((s, i) => (
                <span key={i} className="bg-primary-50 text-primary-500 text-xs px-3 py-1 rounded-lg">{s.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">岗位职责</h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {job.responsibilities.split(/[;；。]/).filter(Boolean).map((line, i) => (
                <p key={i} className="mb-1.5 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>{line.trim()}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          {applied ? (
            <button className="flex-1 bg-green-50 text-green-600 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2" disabled>
              <CheckCircle className="w-5 h-5" />已投递
            </button>
          ) : (
            <>
              <button 
                onClick={() => window.open(job.apply_url, '_blank')}
                className="btn-outline flex-1 flex items-center justify-center gap-1.5 text-sm !py-3"
              >
                <ExternalLink className="w-4 h-4" />官网投递
              </button>
              <button 
                onClick={handleApply}
                disabled={applying}
                className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm !py-3"
              >
                {applying ? '投递中...' : '一键投递'} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">投递成功！</h3>
              <p className="text-sm text-gray-500 mb-4">
                {user?.education && ['硕士','博士'].includes(user.education) 
                  ? '您的简历匹配度较高，HR将优先查看'
                  : '已为您打开腾讯官方投递入口，请完善信息并提交投递'
                }
              </p>
              <div className="flex gap-3">
                <button onClick={() => navigate('/progress')} className="btn-outline flex-1 text-sm">查看进度</button>
                <button onClick={() => setShowModal(false)} className="btn-primary flex-1 text-sm">继续投递</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
