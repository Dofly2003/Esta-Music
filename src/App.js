// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl } from "./auth.js";

function App() {
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");

  // Ambil token dari URL hash (akses token)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const tokenFromUrl = new URLSearchParams(hash.substring(1)).get("access_token");
      localStorage.setItem("spotify_token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.location.hash = "";
    }
  }, []);

  // Fetch top tracks
  useEffect(() => {
    if (!token) return;

    const fetchPlaylists = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTracks(res.data.items); // masih pakai nama state 'tracks'
      } catch (error) {
        console.error("Error fetching playlists", error);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };


    fetchPlaylists();
  }, [token]);

  // Jika belum login
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

  // Tampilan track setelah login
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🎵 Your Top 5 Spotify Tracks</h1>
      <div className="grid gap-6">
        {tracks.map((track, i) => (
          <div key={i} className="bg-white p-4 rounded shadow-md flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <img
                src={track.album.images[0].url}
                alt={track.name}
                className="w-16 h-16 rounded"
              />
              <div>
                <div className="font-semibold text-lg">{track.name}</div>
                <div className="text-sm text-gray-600">
                  {track.artists.map((a) => a.name).join(", ")}
                </div>
              </div>
            </div>
            {/* Spotify embed player */}
            <iframe
              src={`https://open.spotify.com/embed/track/${track.id}`}
              width="100%"
              height="80"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
              title={track.name}
              className="rounded"
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
