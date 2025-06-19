import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl } from "./auth";

const clientId = "SPOTIFY_CLIENT_ID_KAMU"; // GANTI dengan client ID kamu
const redirectUri = "https://esta-music.vercel.app"; // Sesuai yang kamu daftarkan di Spotify dashboard

function App() {
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");

  // Ambil code dari URL & tukar dengan access_token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !token) {
      const codeVerifier = localStorage.getItem("spotify_code_verifier");

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      });

      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("spotify_token", data.access_token);
            setToken(data.access_token);
            window.history.replaceState({}, document.title, "/"); // bersihkan URL
          } else {
            console.error("Token exchange failed", data);
          }
        });
    }
  }, [token]);

  // Ambil top track Spotify user
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
        console.error("Error fetching tracks", error);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };

    fetchTopTracks();
  }, [token]);

  // Belum login
  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="h-screen flex items-center justify-center bg-black text-white">
          <button
            onClick={async () => {
              const authUrl = await createAuthUrl(); // ← panggil fungsi buat auth URL
              window.location.href = authUrl; // redirect ke login Spotify
            }}
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded text-lg font-bold"
          >
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  // Sudah login dan tampilkan lagu
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎵 Top 5 Spotify Tracks</h1>
      <div className="grid gap-4">
        {tracks.map((track, i) => (
          <div
            key={i}
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
