import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useApp';
import Layout from './components/Layout';

// 用户端页面
import UserHome from './pages/user/Home';
import ResumeUpload from './pages/user/ResumeUpload';
import MatchResult from './pages/user/MatchResult';
import JobApply from './pages/user/JobApply';
import JobProgress from './pages/user/JobProgress';
import UserCenter from './pages/user/UserCenter';
import Login from './pages/user/Login';

// HR端页面
import HrDashboard from './pages/hr/Dashboard';
import HrCandidates from './pages/hr/Candidates';
import HrRejectionPool from './pages/hr/RejectionPool';
import HrLogin from './pages/hr/HrLogin';

// 管理端页面
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        {/* 用户端 */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout type="user" />}>
          <Route index element={<UserHome />} />
          <Route path="upload" element={<ResumeUpload />} />
          <Route path="match" element={<MatchResult />} />
          <Route path="apply/:jobId" element={<JobApply />} />
          <Route path="progress" element={<JobProgress />} />
          <Route path="center" element={<UserCenter />} />
        </Route>
        
        {/* HR端 */}
        <Route path="/hr/login" element={<HrLogin />} />
        <Route path="/hr" element={<Layout type="hr" />}>
          <Route index element={<HrDashboard />} />
          <Route path="candidates" element={<HrCandidates />} />
          <Route path="rejections" element={<HrRejectionPool />} />
        </Route>
        
        {/* 管理端 */}
        <Route path="/admin" element={<Layout type="admin" />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
