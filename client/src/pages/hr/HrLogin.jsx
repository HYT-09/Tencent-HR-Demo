import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { Briefcase, Mail, ArrowRight } from 'lucide-react';

export default function HrLogin() {
  const [email, setEmail] = useState('');
  const { loginAsHr, loading } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await loginAsHr(email);
      navigate('/hr');
    } catch (err) {
      alert('登录失败：' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HR工作台</h1>
          <p className="text-gray-500 mt-2 text-sm">腾讯校招候选人管理系统</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">企业邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="请输入腾讯企业邮箱"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
          <button type="submit" disabled={loading || !email} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
            {loading ? '登录中...' : '登录'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary-500 hover:underline">返回用户端</a>
        </div>
      </div>
    </div>
  );
}
