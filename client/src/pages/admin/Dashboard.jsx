import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Briefcase, Users, FileText, TrendingUp, Plus, Edit3, Trash2, BarChart3, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '', department: '', city: '', education_req: '本科', major_req: '', 
    skills_req: '', responsibilities: '', apply_url: '', salary_range: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsData, jobsData] = await Promise.all([
        api.getAdminStats(),
        api.getJobs({ limit: 10 })
      ]);
      setStats(statsData);
      setJobs(jobsData.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      await api.createJob(jobForm);
      setShowAddJob(false);
      setJobForm({ title: '', department: '', city: '', education_req: '本科', major_req: '', skills_req: '', responsibilities: '', apply_url: '', salary_range: '' });
      loadData();
    } catch (e) {
      alert('添加失败：' + e.message);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('确定下架该岗位？')) return;
    try {
      await api.deleteJob(id);
      loadData();
    } catch (e) {
      alert('操作失败');
    }
  };

  const { jobStats = {}, userStats = {}, appStats = {}, matchDistribution = [] } = stats || {};

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: '总岗位数', value: jobStats.total, icon: Briefcase, color: 'from-primary-500 to-primary-400', sub: `在招 ${jobStats.active}` },
          { label: '总用户数', value: userStats.total, icon: Users, color: 'from-green-500 to-green-400', sub: `今日 +${userStats.todayNew}` },
          { label: '总投递数', value: appStats.total, icon: FileText, color: 'from-orange-500 to-orange-400', sub: `待处理 ${appStats.applied}` },
          { label: '今日新增岗位', value: jobStats.todayNew, icon: TrendingUp, color: 'from-purple-500 to-purple-400', sub: `已关闭 ${jobStats.closed}` },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-gray-400">{card.sub}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value || 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Application Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary-500" />投递状态分布
          </h3>
          <div className="flex items-end gap-3 h-32">
            {[
              { label: '已投递', value: appStats.applied || 0, color: 'bg-blue-400' },
              { label: '已邀约', value: appStats.invited || 0, color: 'bg-green-400' },
              { label: '已拒绝', value: appStats.rejected || 0, color: 'bg-red-400' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-50 rounded-t-lg relative" style={{ height: '100px' }}>
                  <div 
                    className={`absolute bottom-0 left-0 right-0 ${bar.color} rounded-t-lg transition-all`}
                    style={{ height: `${Math.max((bar.value / Math.max(appStats.total || 1)) * 100, 5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-2">{bar.label}</span>
                <span className="text-xs font-bold text-gray-700">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Match Level Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary-500" />匹配等级分布
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                {(() => {
                  const total = matchDistribution.reduce((s, d) => s + d.count, 0) || 1;
                  let offset = 0;
                  const colors = { S: '#2A5CFF', A: '#34C759', B: '#FF9500', C: '#8E8E93' };
                  return matchDistribution.map((d, i) => {
                    const pct = d.count / total;
                    const len = pct * 251.33;
                    const el = (
                      <circle key={i} cx="50" cy="50" r="40" fill="none" 
                        stroke={colors[d.match_level] || '#ccc'} strokeWidth="12"
                        strokeDasharray={`${len} 251.33`} strokeDashoffset={-offset} />
                    );
                    offset += len;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{appStats.total || 0}</div>
                  <div className="text-[10px] text-gray-400">总投递</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {[{l:'S级',c:'bg-primary-500'},{l:'A级',c:'bg-green-500'},{l:'B级',c:'bg-orange-500'},{l:'C级',c:'bg-gray-400'}].map((item,i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 ${item.c} rounded-sm`} />
                <span className="text-[10px] text-gray-500">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary-500" />岗位管理
          </h3>
          <button onClick={() => setShowAddJob(true)} className="btn-primary text-xs !py-2 !px-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />添加岗位
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-50">
                <th className="text-left py-3 px-5 font-medium">岗位名称</th>
                <th className="text-left py-3 px-3 font-medium">部门</th>
                <th className="text-left py-3 px-3 font-medium">城市</th>
                <th className="text-left py-3 px-3 font-medium">状态</th>
                <th className="text-left py-3 px-3 font-medium">更新时间</th>
                <th className="text-right py-3 px-5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-5 text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="py-3 px-3 text-sm text-gray-500">{job.department}</td>
                  <td className="py-3 px-3 text-sm text-gray-500">{job.city}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {job.status === 'active' ? '招聘中' : '已关闭'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-400">{new Date(job.updated_at || job.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-5 text-right">
                    <button className="text-xs text-primary-500 hover:underline mr-2">编辑</button>
                    <button onClick={() => handleDeleteJob(job.id)} className="text-xs text-red-500 hover:underline">下架</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddJob(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">添加新岗位</h3>
            <div className="space-y-3">
              {[
                { key: 'title', label: '岗位名称', placeholder: '如：前端开发工程师' },
                { key: 'department', label: '部门', placeholder: '如：微信事业群' },
                { key: 'city', label: '城市', placeholder: '如：深圳/北京' },
                { key: 'education_req', label: '学历要求', placeholder: '如：本科' },
                { key: 'major_req', label: '专业要求', placeholder: '如：计算机科学' },
                { key: 'skills_req', label: '技能要求', placeholder: '如：React,Vue,TypeScript' },
                { key: 'salary_range', label: '薪资范围', placeholder: '如：30K-50K' },
                { key: 'apply_url', label: '投递链接', placeholder: '如：https://join.qq.com/...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-gray-600 mb-1 block">{field.label}</label>
                  <input
                    type="text"
                    value={jobForm[field.key]}
                    onChange={e => setJobForm({...jobForm, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">岗位职责</label>
                <textarea
                  value={jobForm.responsibilities}
                  onChange={e => setJobForm({...jobForm, responsibilities: e.target.value})}
                  placeholder="请输入岗位职责描述"
                  rows="3"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddJob(false)} className="btn-outline flex-1 text-sm">取消</button>
              <button onClick={handleAddJob} className="btn-primary flex-1 text-sm">添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
