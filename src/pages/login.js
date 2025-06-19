import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAuthUrl, getTokenFromCode } from "../auth";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Jika sudah login, langsung ke /
    const storedToken = localStorage.getItem("spotify_token");
    if (storedToken) {
      navigate("/", { replace: true });
      return;
    }

    // Jika ada ?code= di URL (callback dari Spotify)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getTokenFromCode(code).then((token) => {
        if (token) {
          navigate("/", { replace: true });
        }
      });
    }
  }, [navigate]);

  const handleLogin = async () => {
    const url = await createAuthUrl();
    window.location.href = url;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <button onClick={handleLogin} className="px-6 py-3 bg-green-500 rounded font-bold text-lg">
        Login with Spotify
      </button>
    </div>
  );
}

export default Login;