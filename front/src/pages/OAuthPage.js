import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("github_token", token);
      navigate("/repos");
    }
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen text-lg">로그인 중...</div>;
};

export default OAuthPage; 