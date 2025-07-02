import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ResultPage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const pr_number = localStorage.getItem('scan_pr_number');
    const token = localStorage.getItem('github_token');
    if (!pr_number || !token) return;
    axios.get(`http://localhost:8000/scan/${pr_number}`, {
      headers: { Authorization: `token ${token}` }
    }).then(res => setResults(res.data.results));
  }, []);

  const getRowColor = (result) => {
    if (!result.result) return 'bg-green-100';
    if (result.result && result.accuracy < 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="m-10">
      <h2 className="text-2xl font-bold mb-6">검사 결과</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">검사항목</th>
            <th className="p-2 border">결과</th>
            <th className="p-2 border">정확도</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx} className={getRowColor(r)}>
              <td className="p-2 border">{r.type}</td>
              <td className="p-2 border">{r.result ? 'True' : 'False'}</td>
              <td className="p-2 border">{r.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultPage; 