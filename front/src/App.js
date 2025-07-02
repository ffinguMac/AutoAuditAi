import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RepoSelectPage from './pages/RepoSelectPage';
import PRListPage from './pages/PRListPage';
import ResultPage from './pages/ResultPage';
import OAuthPage from './pages/OAuthPage';

const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('selected_repo');
    localStorage.removeItem('scan_pr_number');
    window.location.href = 'https://github.com/logout';
  };
  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      aria-label="로그아웃"
    >
      로그아웃
    </button>
  );
};

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-gray-50 relative">
      <LogoutButton />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/repos" element={<RepoSelectPage />} />
        <Route path="/prs" element={<PRListPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/oauth" element={<OAuthPage />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App; 