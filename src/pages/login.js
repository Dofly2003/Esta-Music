import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAuthUrl, getTokenFromCode } from "../auth";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Cek jika sudah login
    const storedToken = localStorage.getItem("spotify_token");
    if (storedToken) {
      navigate("/", { replace: true });
      return;
    }

    // Cek kode dari Spotify callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getTokenFromCode(code).then((token) => {
        if (token) {
          localStorage.setItem("spotify_token", token);
          // Bersihkan URL dari ?code=
          window.history.replaceState({}, document.title, "/");
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