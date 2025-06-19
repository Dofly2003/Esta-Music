import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl } from "./auth.js";

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🎶 Top Artists & Shuffle Songs ygy</h1>

      <div className="grid gap-10">
        {artists.map((artist) => (
          <div key={artist.id} className="mb-6">
            <div className="flex items-center gap-4">
              <img src={artist.images[0]?.url} className="w-12 h-12 rounded-full" />
              <span className="font-bold text-lg">{artist.name}</span>
            </div>
            <button
              className="mt-2 bg-green-500 text-white px-4 py-1 rounded"
              onClick={async () => {
                const tracks = await fetchTopTracksByArtist(artist.id, token);
                setSelectedTracks(tracks);
              }}
            >
              Show Songs
            </button>
          </div>
        ))}

        {selectedTracks.length > 0 && (
          <div className="mt-4">
            <h2 className="font-bold text-xl mb-2">Tracks</h2>
            {selectedTracks.map((track) => (
              <div key={track.id} className="flex items-center gap-4 mb-2">
                <img src={track.album.images[0]?.url} className="w-10 h-10 rounded" />
                <span>{track.name}</span>
                <audio controls src={track.preview_url}></audio>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
