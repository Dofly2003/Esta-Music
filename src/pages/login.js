import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAuthUrl, getTokenFromCode } from "../auth.js";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getTokenFromCode(code).then((token) => {
        if (token) {
          localStorage.setItem("spotify_token", token);
          navigate("/");
        }
      });
    }
  }, [navigate]);

  const handleLogin = async () => {
    const url = await createAuthUrl();
    window.location.href = url;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <button
        onClick={handleLogin}
        className="bg-green-500 px-6 py-3 rounded-lg text-lg font-bold hover:bg-green-600"
      >
        Login with Spotify
      </button>
    </div>
  );
}

export default Login;
