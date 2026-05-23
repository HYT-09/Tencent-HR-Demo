import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { api } from '../../utils/api';
import { Camera, FileText, Upload, Check, Loader2, AlertCircle, ArrowRight, UserPlus, Sparkles, ClipboardPaste } from 'lucide-react';

const UPLOAD_STEPS = [
  { key: 'upload', label: '上传中', icon: Upload },
  { key: 'parse', label: 'AI解析中', icon: FileText },
  { key: 'match', label: '智能匹配中', icon: Check },
];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewUser = location.state?.isNewUser;
  const userName = location.state?.userName;
  const { user, refreshUser } = useApp();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('idle'); // idle, upload, parse, match, done, error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedInfo, setParsedInfo] = useState(null);
  const [resumeText, setResumeText] = useState('');

  const handleUpload = async (type) => {
    if (type === 'file') {
      fileInputRef.current?.click();
      return;
    }
    if (type === 'paste') {
      return; // 粘贴模式需要用户手动点提交
    }
    await processResume();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('文件大小不能超过20MB');
      return;
    }

    const isDocFile = /\.(pdf|doc|docx)$/i.test(file.name);

    if (isDocFile) {
      // PDF/DOCX 文件：直接上传文件到服务端解析
      await processResumeWithFile(file);
    } else {
      // 纯文本文件：前端读取文本后发送
      let fileText = '';
      try {
        fileText = await file.text();
        if (fileText && fileText.trim().length >= 10) {
          setResumeText(fileText);
        }
      } catch {}
      await processResume(fileText);
    }
  };

  const handlePasteSubmit = async () => {
    if (!resumeText || resumeText.trim().length < 10) {
      setErrorMsg('请粘贴简历文本内容（至少10个字符）');
      return;
    }
    setErrorMsg('');
    await processResume(resumeText);
  };

  const processResume = async (text) => {
    if (!user?.id) return;
    setStep('upload');
    setProgress(0);
    setErrorMsg('');

    try {
      // Step 1: Upload
      for (let i = 0; i <= 33; i += 11) {
        setProgress(i);
        await sleep(150);
      }
      setStep('parse');

      // Step 2: Parse — 传递简历文本给 AI
      const parseResult = await api.parseResume(user.id, text || resumeText || '');
      for (let i = 33; i <= 66; i += 11) {
        setProgress(i);
        await sleep(200);
      }
      setStep('match');

      // Step 3: Match
      const results = await api.matchJobs(user.id);
      for (let i = 66; i <= 100; i += 17) {
        setProgress(i);
        await sleep(150);
      }

      await refreshUser();
      // 使用 API 返回的真实解析结果
      const parsed = parseResult?.parsed || parseResult?.user?.resume_parsed || {};
      setParsedInfo({
        education: parsed.education || '',
        major: parsed.major || '',
        major_category: parsed.major_category || '',
        skills: parsed.skills || '',
        experience: parsed.experience || '',
        projects: parsed.projects || '',
        university: parsed.university || '',
      });
      setStep('done');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '处理失败，请重试');
      setStep('error');
    }
  };

  const processResumeWithFile = async (file) => {
    if (!user?.id) return;
    setStep('upload');
    setProgress(0);
    setErrorMsg('');

    try {
      // Step 1: Upload
      for (let i = 0; i <= 33; i += 11) {
        setProgress(i);
        await sleep(150);
      }
      setStep('parse');

      // Step 2: Parse — 上传文件到服务端，由服务端提取文本并调用 AI
      const parseResult = await api.parseResumeFile(user.id, file);
      for (let i = 33; i <= 66; i += 11) {
        setProgress(i);
        await sleep(200);
      }
      setStep('match');

      // Step 3: Match
      const results = await api.matchJobs(user.id);
      for (let i = 66; i <= 100; i += 17) {
        setProgress(i);
        await sleep(150);
      }

      await refreshUser();
      const parsed = parseResult?.parsed || parseResult?.user?.resume_parsed || {};
      setParsedInfo({
        education: parsed.education || '',
        major: parsed.major || '',
        major_category: parsed.major_category || '',
        skills: parsed.skills || '',
        experience: parsed.experience || '',
        projects: parsed.projects || '',
        university: parsed.university || '',
      });
      setStep('done');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '处理失败，请重试');
      setStep('error');
    }
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-white px-4 pt-12 pb-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">简历解析完成！</h2>
          <p className="text-sm text-gray-500 mt-1">AI已为您智能匹配最佳岗位</p>
        </div>

        {parsedInfo && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 解析结果</h3>
            <div className="space-y-2.5">
              {[
                { label: '学历', value: parsedInfo.education },
                { label: '专业', value: parsedInfo.major },
                { label: '专业大类', value: parsedInfo.major_category },
                { label: '核心技能', value: parsedInfo.skills },
                { label: '实习经历', value: parsedInfo.experience },
                { label: '项目经历', value: parsedInfo.projects },
                ...(parsedInfo.university ? [{ label: '毕业院校', value: parsedInfo.university }] : []),
              ].filter(item => item.value).map((item, i) => (
                <div key={i}>
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <p className="text-sm text-gray-700 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate('/match')}
          className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5"
        >
          查看匹配结果 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (['upload', 'parse', 'match'].includes(step)) {
    const currentStepIndex = UPLOAD_STEPS.findIndex(s => s.key === step);
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-xs text-center">
          <div className="relative mb-8">
            <svg className="w-32 h-32 mx-auto -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="8" />
              <circle 
                cx="60" cy="60" r="50" fill="none" stroke="#2A5CFF" strokeWidth="8"
                strokeDasharray={`${progress * 3.14} 314`} strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-500">{progress}%</span>
            </div>
          </div>

          <div className="flex justify-between mb-6">
            {UPLOAD_STEPS.map((s, i) => (
              <div key={s.key} className={`flex flex-col items-center ${i <= currentStepIndex ? 'text-primary-500' : 'text-gray-300'}`}>
                <s.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">{s.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            {step === 'upload' && '正在上传您的简历...'}
            {step === 'parse' && 'AI正在识别简历内容...'}
            {step === 'match' && '正在智能匹配最佳岗位...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">处理失败</h3>
        <p className="text-sm text-gray-500 mb-6 text-center">{errorMsg}</p>
        <button onClick={() => { setStep('idle'); setErrorMsg(''); }} className="btn-primary">重新上传</button>
      </div>
    );
  }

  // Idle - upload options
  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-8">
      {isNewUser && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-5 flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-700">
              {userName ? `${userName}，欢迎加入！` : '欢迎加入！'}
            </p>
            <p className="text-xs text-primary-600 mt-0.5">
              账号已创建成功，上传简历即可获得AI智能岗位匹配
            </p>
          </div>
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-1">上传简历</h2>
      <p className="text-sm text-gray-500 mb-6">支持粘贴文本、PDF、Word格式上传</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => handleUpload('camera')}
          className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-primary-400 transition-colors"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-primary-600">拍照上传</span>
        </button>

        <button
          onClick={() => handleUpload('file')}
          className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-primary-400 transition-colors"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-primary-600">文件上传</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('resume-text-input');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-primary-400 transition-colors"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <ClipboardPaste className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-primary-600">粘贴文本</span>
        </button>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".pdf,.doc,.docx,.txt" 
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 粘贴文本区域 */}
      <div id="resume-text-input" className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">粘贴简历文本</h3>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="请将简历内容粘贴到此处，AI 将自动提取学历、专业、技能等关键信息..."
          className="w-full h-36 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
        />
        <button
          onClick={handlePasteSubmit}
          disabled={!resumeText || resumeText.trim().length < 10}
          className="btn-primary w-full mt-3 flex items-center justify-center gap-2 !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          AI 智能解析
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">上传须知</h3>
        <ul className="text-xs text-gray-500 space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>支持粘贴简历文本，AI 自动提取关键信息</li>
          <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>支持 PDF、DOC、DOCX 格式文件</li>
          <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>支持拍照/截图简历上传</li>
          <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>AI 识别准确率≥90%</li>
          <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span>文件大小不超过20MB</li>
        </ul>
      </div>
    </div>
  );
}
