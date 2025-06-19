// src/pages/playlist.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Playlist() {
  const { playlistId } = useParams();
  const [token] = useState(localStorage.getItem("spotify_token"));
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("You need to login with Spotify first.");
      setLoading(false);
      return;
    }

    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlaylist(res.data);
      } catch (err) {
        console.error("Playlist error:", err);
        if (err.response?.status === 401) {
          setError("Unauthorized. Please login again.");
        } else if (err.response?.status === 404) {
          setError("Playlist not found.");
        } else {
          setError("Failed to load playlist.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId, token]);

  if (loading) return <div className="p-8">Loading playlist...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!playlist) return <div className="p-8">No data found.</div>;

  const tracks = Array.isArray(playlist.tracks.items) ? playlist.tracks.items : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link to="/" className="text-blue-500 underline mb-4 inline-block">← Back to Home</Link>
      <div className="flex items-center gap-6 mb-8">
        <img src={playlist.images?.[0]?.url} alt={playlist.name} className="w-32 h-32 rounded" />
        <div>
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <p className="text-gray-600">by {playlist.owner.display_name}</p>
          <p className="text-gray-500">{playlist.tracks.total} songs</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Tracks</h2>
      <ol className="space-y-4">
        {tracks.length === 0 && <p className="text-gray-600">No tracks found.</p>}
        {tracks.map((item, idx) => (
          item.track && (
            <li key={item.track.id} className="bg-white p-4 rounded shadow flex items-center gap-4">
              <span className="w-6 text-gray-500">{idx + 1}</span>
              <img src={item.track.album.images?.[0]?.url} alt={item.track.name} className="w-12 h-12 rounded" />
              <div className="flex-1">
                <div className="font-semibold">{item.track.name}</div>
                <div className="text-sm text-gray-600">
                  {item.track.artists.map(a => a.name).join(", ")}
                </div>
              </div>
              <iframe
                src={`https://open.spotify.com/embed/track/${item.track.id}`}
                width="250"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                title={item.track.name}
                className="rounded"
              />
            </li>
          )
        ))}
      </ol>
    </div>
  );
}

export default Playlist;
