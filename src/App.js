import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl, getTokenFromCode } from "./auth.js";

function App() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [artists, setArtists] = useState([]);

  // Ambil kode dari URL (authorization code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !token) {
      getTokenFromCode(code); // tukar kode dengan access token
    }
  }, [token]);

  // Ambil artist top user jika token ada
  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=5", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setArtists(res.data.items);
      } catch (err) {
        console.error("Token error:", err);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };

    if (token) {
      fetchTopArtists();
    }
  }, [token]);

  // Login button
  const handleLogin = async () => {
    const authUrl = await createAuthUrl();
    window.location.href = authUrl;
  };

  if (!token) {
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">🎧 Top Artists & Shuffle Songssssssssssssssssss</h1>
      <ul className="space-y-4">
        {artists.map((artist) => (
          <li key={artist.id} className="flex items-center gap-4 bg-white p-4 rounded shadow">
            <img src={artist.images[0]?.url} alt={artist.name} className="w-16 h-16 rounded-full" />
            <span className="font-medium text-lg">{artist.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
