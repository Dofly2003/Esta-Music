import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl, getTokenFromCode } from "./auth";

function App() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code && !token) {
      (async () => {
        try {
          const accessToken = await getTokenFromCode(code);
          if (accessToken) {
            localStorage.setItem("spotify_token", accessToken);
            setToken(accessToken);
            window.history.replaceState({}, "", "/"); // Bersihkan URL dari ?code=
          }
        } catch (error) {
          console.error("Failed to get access token", error);
        }
      })();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchTopTracks = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTracks(res.data.items);
      } catch (error) {
        console.error("Failed to fetch top tracks", error);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };

    fetchTopTracks();
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎧 Top 5 Spotify Tracks</h1>
      <div className="grid gap-4">
        {tracks.map((track, index) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded flex items-center gap-4 shadow"
          >
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
        ))}
      </div>
    </div>
  );
}

export default App;
