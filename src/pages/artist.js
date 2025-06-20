import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Artist() {
  const { artistId } = useParams();
  const token = localStorage.getItem("spotify_token");
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [volume, setVolume] = useState(0.5);
  const audioRefs = useRef({});

  useEffect(() => {
    if (!token) return;

    // Get artist profile
    axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setArtist(res.data));

    // Get artist top tracks
    axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ID`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTracks(res.data.tracks));
  }, [artistId, token]);

  // Update volume to all audio elements
  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.volume = volume;
    });
  }, [volume]);

  if (!artist) return <div className="text-white p-8">Loading artist...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-700 text-white px-4 py-10">
      <Link to="/" className="text-green-300 hover:text-green-100 underline mb-6 inline-block">← Kembali</Link>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{artist.name}</h1>
        <p className="text-gray-300">{artist.followers.total.toLocaleString()} followers</p>
      </div>

      <div className="flex items-center gap-4 justify-center mb-8">
        <label className="text-white">Volume 🎚️</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-40"
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="max-w-3xl mx-auto">
        {tracks.map((track, index) => (
          <div key={track.id} className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-4 flex items-center justify-between hover:bg-white/20 transition">
            <div className="flex-1">
              <div className="font-bold text-lg">{index + 1}. {track.name}</div>
              <div className="text-sm text-gray-300">{track.artists.map(a => a.name).join(", ")}</div>
            </div>
            <div className="flex items-center gap-4">
              {track.preview_url ? (
                <audio
                  controls
                  ref={(el) => (audioRefs.current[track.id] = el)}
                  src={track.preview_url}
                  className="h-8"
                />
              ) : (
                <span className="text-sm text-gray-400">No preview</span>
              )}
              <div className="text-sm text-gray-300">{Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Artist;
