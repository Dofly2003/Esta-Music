import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAuthUrl, getTokenFromCode } from "../auth";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getTokenFromCode(code).then((token) => {
        if (token) {
          navigate("/home");
        }
      });
    }
  }, []);

  const handleLogin = async () => {
    const url = await createAuthUrl();
    window.location.href = url;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <button onClick={handleLogin} className="px-6 py-3 bg-green-500 rounded">
        Login with Spotify
      </button>
    </div>
  );
}

export default Login;
