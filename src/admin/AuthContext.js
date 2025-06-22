import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 컨텍스트 생성
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 자동 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    const name = localStorage.getItem('adminName');
    if (token && role === 'ADMIN') {
      setUser({ token, role, name: name || 'Admin' });
      // axios 기본 헤더 설정 (모든 요청에 토큰 첨부)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // 로그인 함수 (API 연동)
  const login = async (credentials) => {
    try {
      // credentials: { id, password }
      const res = await axios.post('/api/auth/login', {
        username: credentials.id,
        password: credentials.password,
      });

      // 백엔드에서 plain text(토큰)이나 {token: "..."}로 응답할 수 있음
      const token = typeof res.data === 'string' ? res.data : res.data.token;
      // 토큰을 decode해서 role 추출(옵션) → 아니면 아래처럼 /api/auth/me 등에서 조회
      // 여기서는 role/이름을 별도 API로 받아온다고 가정
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userInfoRes = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // userInfoRes.data: { username, name, role, ... }
      if (userInfoRes.data.role !== 'ADMIN') {
        return { success: false, message: '관리자 권한이 없습니다.' };
      }

      // 저장
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRole', userInfoRes.data.role);
      localStorage.setItem('adminName', userInfoRes.data.name || userInfoRes.data.username);

      setUser({
        token,
        role: userInfoRes.data.role,
        name: userInfoRes.data.name || userInfoRes.data.username,
      });

      return { success: true };
    } catch (e) {
      let msg = '로그인 실패';
      if (e.response?.data) msg = typeof e.response.data === 'string' ? e.response.data : (e.response.data.message || msg);
      return { success: false, message: msg };
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
