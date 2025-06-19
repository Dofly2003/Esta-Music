import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [tracks, setTracks] = useState([]);
  const token = localStorage.getItem("spotify_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTracks(res.data.items);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setTracks([]);
        }
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎧 Top Tracks</h1>
      {tracks.map((track) => (
        <div key={track.id} className="mb-4">
          <p>{track.name} - {track.artists[0].name}</p>
        </div>
      ))}

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate("/player")}
      >
        Go to Player
      </button>
    </div>
  );
}

export default Home;
