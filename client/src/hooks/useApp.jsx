import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hr, setHr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tencent_recruit_user');
    if (saved) setUser(JSON.parse(saved));
    const savedHr = localStorage.getItem('tencent_recruit_hr');
    if (savedHr) setHr(JSON.parse(savedHr));
  }, []);

  const loginAsUser = async (phone, name) => {
    setLoading(true);
    try {
      const data = await api.userLogin(phone, name);
      const isNew = data.isNewUser;
      delete data.isNewUser;
      setUser(data);
      localStorage.setItem('tencent_recruit_user', JSON.stringify(data));
      return { ...data, isNewUser: isNew };
    } finally { setLoading(false); }
  };

  const loginAsHr = async (email) => {
    setLoading(true);
    try {
      const data = await api.hrLogin(email);
      setHr(data);
      localStorage.setItem('tencent_recruit_hr', JSON.stringify(data));
      return data;
    } finally { setLoading(false); }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    const data = await api.getUser(user.id);
    setUser(data);
    localStorage.setItem('tencent_recruit_user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setHr(null);
    localStorage.removeItem('tencent_recruit_user');
    localStorage.removeItem('tencent_recruit_hr');
  };

  return (
    <AppContext.Provider value={{ user, hr, loading, loginAsUser, loginAsHr, refreshUser, logout, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
