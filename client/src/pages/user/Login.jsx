import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { Briefcase, Smartphone, ArrowRight, UserPlus } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const { loginAsUser, loading } = useApp();
  const navigate = useNavigate();

  const isValidPhone = /^1[3-9]\d{9}$/.test(phone);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidPhone) return;
    try {
      const data = await loginAsUser(phone, name || `用户${phone.slice(-4)}`);
      if (data.isNewUser) {
        // 新用户注册成功，跳转到简历上传页引导完善信息
        navigate('/resume', { state: { isNewUser: true, userName: data.name } });
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('操作失败：' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">腾讯校招求职平台</h1>
          <p className="text-gray-500 mt-2 text-sm">AI智能匹配，精准推荐校招岗位</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">手机号</label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setPhone(val);
                  setIsNewUser(false);
                }}
                placeholder="请输入11位手机号"
                maxLength={11}
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  phone.length === 11 && !isValidPhone 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500'
                }`}
              />
            </div>
            {phone.length === 11 && !isValidPhone && (
              <p className="text-xs text-red-500 mt-1">请输入正确的11位手机号</p>
            )}
            {isValidPhone && isNewUser && (
              <p className="text-xs text-primary-500 mt-1 flex items-center gap-1">
                <UserPlus className="w-3 h-3" /> 新手机号将自动创建账号
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              姓名
              {!isNewUser && <span className="text-gray-400 font-normal">（选填）</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isValidPhone}
            className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5"
          >
            {loading ? '请稍候...' : (
              <>
                <span>登录 / 注册</span> <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400">
            输入手机号即可登录，新号码将自动注册
          </p>
        </form>

        {/* Other entry */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-3">其他入口</p>
          <div className="flex justify-center gap-6">
            <a href="/hr/login" className="text-sm text-primary-500 hover:underline">HR端登录</a>
            <a href="/admin" className="text-sm text-gray-500 hover:underline">管理后台</a>
          </div>
        </div>
      </div>
    </div>
  );
}
