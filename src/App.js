import { useState, useEffect } from "react";
import axios from "axios";
import { authUrl } from "./auth";

function App() {
  console.log("App Loaded"); // Tambahkan ini
  const [tracks, setTracks] = useState([]);
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    const fetchTopTracks = async () => {
      const res = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTracks(res.data.items);
    };

    if (token) {
      fetchTopTracks();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center">
        <a
          href={authUrl}
          className="bg-green-500 text-white px-6 py-3 rounded shadow text-lg"
        >
          Login with Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎵 Top 5 Tracks</h1>
      <div className="grid gap-4">
        {tracks.map((track, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded flex items-center gap-4">
            <img src={track.album.images[0].url} alt="" className="w-16 h-16 rounded" />
            <div>
              <div className="text-lg font-semibold">{track.name}</div>
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
