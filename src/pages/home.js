import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth.js";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Cek token dari URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !token) {
      getTokenFromCode(code).then((newToken) => {
        if (newToken) {
          localStorage.setItem("spotify_token", newToken);
          setToken(newToken);
        }
        window.history.replaceState({}, document.title, "/");
      });
    }
  }, [token]);

  // Search API
  useEffect(() => {
    if (!token || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track,album,artist&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSearchResults(res.data.tracks?.items || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  // Handle Login
  const handleLogin = async () => {
    const authUrl = await createAuthUrl();
    window.location.href = authUrl;
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    setToken("");
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!token ? (
        <div className="flex justify-center items-center h-screen bg-black text-white">
          <button
            onClick={handleLogin}
            className="bg-green-500 px-6 py-3 rounded-lg text-lg font-bold hover:bg-green-600"
          >
            Login with Spotifyy
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">🎵 Spotify Search</h1>
            <div className="flex gap-4">
              <Link to="/player" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Go to Player
              </Link>
              <button onClick={handleLogout} className="text-red-500 underline">Logout</button>
            </div>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search album, artist, or song..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded mb-6"
          />

          {/* Search Results */}
          <div className="space-y-6">
            {searchResults.map((track) => (
              <div key={track.id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center gap-4">
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <h2 className="font-bold text-lg">{track.name}</h2>
                    <p className="text-gray-600">{track.artists.map(a => a.name).join(", ")}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${track.id}`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                    title={track.name}
                  ></iframe>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
