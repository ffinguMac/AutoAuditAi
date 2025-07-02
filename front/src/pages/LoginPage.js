import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleTokenChange = (e) => setToken(e.target.value);

  const handleTokenLogin = () => {
    localStorage.setItem('github_token', token);
    navigate('/repos');
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:8000/auth/github/login';
  };

  return (
    <div className="flex flex-col items-center mt-24">
      <h2 className="text-2xl font-bold mb-8">깃허브 로그인</h2>
      <input
        type="password"
        placeholder="GITHUB ACCESS_TOKEN"
        value={token}
        onChange={handleTokenChange}
        className="p-2 mb-4 w-72 border rounded"
        aria-label="GitHub Access Token 입력"
      />
      <button
        onClick={handleTokenLogin}
        className="p-2 w-48 bg-blue-500 text-white rounded mb-4"
        aria-label="토큰으로 로그인"
      >
        토큰으로 로그인
      </button>
      <button
        onClick={handleGithubLogin}
        className="p-2 w-48 bg-gray-900 text-white rounded"
        aria-label="GitHub로 로그인"
      >
        GitHub로 로그인
      </button>
    </div>
  );
};

export default LoginPage; 