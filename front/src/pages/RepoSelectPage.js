import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RepoSelectPage = () => {
  const [repos, setRepos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (!token) return;
    axios.get('http://localhost:8000/repos', {
      headers: { Authorization: `token ${token}` }
    }).then(res => setRepos(res.data));
  }, []);

  const handleSelectRepo = (repo) => {
    localStorage.setItem('selected_repo', repo.full_name);
    navigate('/prs');
  };

  return (
    <div className="flex flex-col items-center mt-24">
      <h2 className="text-2xl font-bold mb-8">리포지토리 선택</h2>
      <ul className="flex flex-col gap-2 w-80">
        {repos.map(repo => (
          <li key={repo.full_name}>
            <button
              className="w-full p-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring"
              onClick={() => handleSelectRepo(repo)}
              aria-label={repo.full_name}
            >
              {repo.full_name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepoSelectPage; 