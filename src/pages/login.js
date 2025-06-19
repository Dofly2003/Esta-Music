import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAuthUrl, getTokenFromCode } from "../auth";

// Optional: Use a background image or abstract SVG for more fantasy effect
const BG_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"; // Unsplash music theme

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_token");
    if (storedToken) {
      navigate("/", { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getTokenFromCode(code).then((token) => {
        if (token) {
          localStorage.setItem("spotify_token", token);
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
    <div
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(120deg, #1db954 0%, #191414 100%)`,
      }}
    >
      <img
        src={BG_IMAGE}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm pointer-events-none select-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Spotify Fantasy */}
        <div className="mb-8 animate-fadein">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🎧</span>
            <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
              Spotify Fantasy App
            </span>
          </div>
          <p className="mt-2 text-center text-lg text-gray-200 font-light italic tracking-wide">
            Temukan dunia musik tanpa batas, satu klik menuju petualangan nada!
          </p>
        </div>
        {/* Animated musical notes */}
        <div className="mb-12 flex gap-2 animate-bounce-slow">
          <span className="text-3xl text-white/80">🎼</span>
          <span className="text-3xl text-white/70">🎵</span>
          <span className="text-3xl text-white/90">🎶</span>
        </div>
        <button
          onClick={handleLogin}
          className="px-8 py-4 bg-gradient-to-tr from-green-500 to-green-700 hover:from-green-700 hover:to-green-500 text-white font-bold text-xl rounded-full shadow-lg shadow-black/40 transition-all duration-200 ring-2 ring-white/30 hover:scale-105 focus:outline-none animate-pop"
        >
          <svg
            viewBox="0 0 168 168"
            className="inline-block w-7 h-7 mr-3 align-middle"
          >
            <circle fill="#1ED760" cx="84" cy="84" r="84" />
            <path
              fill="#191414"
              d="M120.7,122.6c-1.7,2.7-5.3,3.6-8,1.9c-21.8-13.3-49.3-16.3-81.9-8.6c-3.1,0.7-6.2-1.1-7-4.1
              c-0.7-3.1,1.1-6.2,4.1-7c35.2-8.2,65.8-4.8,90.1,10.1C121.6,115.2,122.5,119.1,120.7,122.6z M131.6,105.1c-2.1,3.3-6.5,4.3-9.8,2.2
              c-25-15.3-63.1-19.7-92.6-10.4c-3.7,1.1-7.7-1-8.8-4.7c-1.1-3.7,1-7.7,4.7-8.8c33.6-10.2,75.1-5.4,103.6,12.1
              C132.7,98.2,133.7,101.8,131.6,105.1z M145.2,87.4c-2.6,4.1-8.1,5.3-12.1,2.7c-28.6-17.5-72.3-19.7-99-10.4
              c-4.7,1.6-9.9-1.1-11.5-5.8c-1.6-4.7,1.1-9.9,5.8-11.5c31.1-10.3,80.4-8.1,113.5,12.1C146.5,78.3,147.8,83.3,145.2,87.4z"
            />
          </svg>
          Login with Spotify
        </button>
        <div className="mt-12 text-center text-gray-200/60 text-sm tracking-wide">
          <span>
            Powered by Spotify API | Crafted with <span className="text-pink-400">♥</span>
          </span>
        </div>
      </div>
      {/* CSS Animations */}
      <style>{`
        .animate-fadein { animation: fadein 1.2s ease; }
        @keyframes fadein { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: none; } }
        .animate-pop { animation: pop .6s cubic-bezier(.25,1.7,.5,1.2); }
        @keyframes pop { 0% { transform: scale(0.9); } 60% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-slow { animation: bounce 2.5s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
      `}</style>
    </div>
  );
}

export default Login;