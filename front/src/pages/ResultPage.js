import React, { useEffect, useState } from 'react';

const ResultPage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const riskResultRaw = localStorage.getItem('risk_result');
    if (!riskResultRaw) return;
    let riskResult;
    try {
      riskResult = JSON.parse(riskResultRaw);
      // 혹시 한 번 더 stringify된 경우
      if (typeof riskResult === 'string') {
        riskResult = JSON.parse(riskResult);
      }
    } catch {
      riskResult = {};
    }
    if (typeof riskResult === 'object' && riskResult !== null) {
      const arr = Object.entries(riskResult).map(([type, value]) => ({
        type,
        ...value
      }));
      setResults(arr);
    } else {
      setResults([]);
    }
  }, []);

  return (
    <div className="m-10">
      <h2 className="text-2xl font-bold mb-6">검사 결과</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">검사항목</th>
            <th className="p-2 border">결과</th>
            <th className="p-2 border">정확도</th>
            <th className="p-2 border">사유</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{r.type}</td>
              <td className="p-2 border">{r.result ? 'True' : 'False'}</td>
              <td className="p-2 border">100%</td>
              <td className="p-2 border">{r.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultPage; 