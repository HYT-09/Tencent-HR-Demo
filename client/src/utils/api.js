const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '请求失败');
  return data.data;
}

export const api = {
  // 用户
  userLogin: (phone, name) => request('/users/login', { method: 'POST', body: JSON.stringify({ phone, name }) }),
  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadResume: (id) => request(`/${id}/resume`, { method: 'POST' }),  // simplified
  parseResume: (id, resumeText) => request(`/users/${id}/resume`, { method: 'POST', body: JSON.stringify({ resumeText }) }),
  parseResumeFile: (id, file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return fetch(`${API_BASE}/users/${id}/resume`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json()).then(data => {
      if (!data.success) throw new Error(data.message || '请求失败');
      return data.data;
    });
  },
  matchJobs: (id) => request(`/users/${id}/match`, { method: 'POST' }),
  getApplications: (id, status) => request(`/users/${id}/applications${status ? `?status=${status}` : ''}`),
  applyJob: (id, jobId) => request(`/users/${id}/apply`, { method: 'POST', body: JSON.stringify({ job_id: jobId }) }),
  getProgress: (id) => request(`/users/${id}/progress`),
  
  // 岗位
  getJobs: (params) => request(`/jobs?${new URLSearchParams(params)}`),
  getJob: (id) => request(`/jobs/${id}`),
  getJobStats: () => request('/jobs/stats/overview'),
  
  // HR
  hrLogin: (email) => request('/hr/login', { method: 'POST', body: JSON.stringify({ email }) }),
  getHrDashboard: (id) => request(`/hr/${id}/dashboard`),
  getCandidates: (id, params) => request(`/hr/${id}/candidates?${new URLSearchParams(params)}`),
  sendInvite: (data) => request('/hr/invite', { method: 'POST', body: JSON.stringify(data) }),
  markResult: (data) => request('/hr/result', { method: 'POST', body: JSON.stringify(data) }),
  getRejections: (id, params) => request(`/hr/${id}/rejections?${new URLSearchParams(params)}`),
  reclaimCandidates: (ids, hrId) => request('/hr/reclaim', { method: 'POST', body: JSON.stringify({ rejection_ids: ids, hr_id: hrId }) }),
  reclaimInvite: (data) => request('/hr/reclaim-invite', { method: 'POST', body: JSON.stringify(data) }),
  
  // Admin
  getAdminStats: () => request('/admin/stats'),
  getLogs: (params) => request(`/admin/logs?${new URLSearchParams(params)}`),
  
  // 岗位管理 (admin)
  createJob: (data) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
};
