import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [currentUri, setCurrentUri] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === "") return;

      axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setResults(res.data.tracks.items))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("spotify_token");
          setToken("");
        }
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, token]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Spotify Embed Player 🎵</h1>
      <input
        type="text"
        placeholder="Search tracks..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      />

      {results.map(track => (
        <div key={track.id} className="bg-white p-4 mb-4 rounded shadow flex items-center gap-4">
          <img src={track.album.images[0]?.url} className="w-16 h-16 rounded" alt={track.name} />
          <div className="flex-1">
            <div className="font-semibold">{track.name}</div>
            <div className="text-sm text-gray-500">{track.artists.map(a => a.name).join(", ")}</div>
          </div>
          <button
            onClick={() => setCurrentUri(track.uri)}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            ▶ Play
          </button>
        </div>
      ))}

      {currentUri && (
        <div className="mt-6">
          <iframe
            title="Spotify Player"
            src={`https://open.spotify.com/embed/track/${currentUri.split(":").pop()}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default Home;
