import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl } from "./auth.js";

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const tokenFromUrl = new URLSearchParams(hash.substring(1)).get("access_token");
      localStorage.setItem("spotify_token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.location.hash = "";
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchPlaylists = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlaylists(res.data.items);
      } catch (error) {
        console.error("Error fetching playlists", error);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };

    fetchPlaylists();
  }, [token]);

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <button
          onClick={async () => {
            const authUrl = await createAuthUrl();
            window.location.href = authUrl;
          }}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded text-lg font-bold"
        >
          Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🎶 Your Spotify Playlists</h1>
      <div className="grid gap-4">
        {playlists.map((playlist, i) => (
          <div key={i} className="bg-white rounded p-4 shadow flex gap-4 items-center">
            <img
              src={playlist.images[0]?.url || ""}
              alt={playlist.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <div className="text-lg font-bold">{playlist.name}</div>
              <div className="text-sm text-gray-600">
                {playlist.tracks.total} track(s)
              </div>
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 text-sm"
              >
                Open in Spotify
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
