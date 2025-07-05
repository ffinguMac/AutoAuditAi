import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PRListPage = () => {
  const [prs, setPrs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const repo = localStorage.getItem('selected_repo');
    const token = localStorage.getItem('github_token');
    if (!repo || !token) return;
    axios.get(`http://localhost:8000/repos/${repo}/pulls`, {
      headers: { Authorization: `token ${token}` }
    }).then(res => setPrs(res.data));
  }, []);

  const handleScanPR = async (pr) => {
    const repo = localStorage.getItem('selected_repo');
    const token = localStorage.getItem('github_token');
    // 1. PR diff 가져오기
    const diffResp = await fetch(
      `https://api.github.com/repos/${repo}/pulls/${pr.number}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3.diff'
        }
      }
    );
    const diff = await diffResp.text();

    // 2. diff를 /analyze-diff로 전달
    axios.post('http://localhost:8000/analyze-diff', {
      diff
    }).then(res => {
      if (res.data && res.data.result) {
        localStorage.setItem('risk_result', JSON.stringify(res.data.result));
      } else {
        localStorage.removeItem('risk_result');
      }
      navigate('/result');
    });
  };

  return (
    <div className="m-10">
      <h2 className="text-2xl font-bold mb-6">PR 리스트</h2>
      <ul className="flex flex-col gap-3">
        {prs.map(pr => (
          <li key={pr.id} className="border rounded p-4 flex items-center justify-between">
            <span>{pr.title} <span className="text-gray-500">#{pr.number}</span></span>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring"
              onClick={() => handleScanPR(pr)}
              aria-label={`PR ${pr.number} 검사하기`}
            >
              검사하기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PRListPage; 