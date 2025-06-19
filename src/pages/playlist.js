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
    setLoading(true);
    setError("");
    const fetchPlaylist = async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlaylist(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError("Token expired or unauthorized. Please login again!");
        } else if (err.response && err.response.status === 404) {
          setError("Playlist not found.");
        } else {
          setError("Failed to load playlist. Please try again.");
        }
      }
      setLoading(false);
    };
    fetchPlaylist();
  }, [playlistId, token]);

  if (loading) return <div className="p-8">Loading playlist...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!playlist) return <div className="p-8">No data found.</div>;

  // Pastikan playlist.tracks.items selalu ada array
  const tracks = Array.isArray(playlist.tracks.items) ? playlist.tracks.items : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link to="/" className="text-blue-500 underline mb-4 inline-block">← Back to Home</Link>
      <div className="flex items-center gap-6 mb-8">
        <img src={playlist.images?.[0]?.url} alt={playlist.name} className="w-32 h-32 rounded" />
        <div>
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <div className="text-gray-600 mb-2">by {playlist.owner.display_name}</div>
          <div className="text-gray-500">{playlist.tracks.total} songs</div>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Tracks</h2>
      <ol className="space-y-4">
        {tracks.length === 0 && <div className="text-gray-600">No tracks found in this playlist.</div>}
        {tracks.map((item, idx) => (
          item.track && // Pastikan track ada
          <li key={item.track.id || idx} className="bg-white rounded shadow p-4 flex items-center gap-4">
            <span className="w-6 text-gray-400">{idx + 1}</span>
            <img src={item.track.album?.images?.[0]?.url} alt={item.track.name} className="w-12 h-12 rounded" />
            <div className="flex-1">
              <div className="font-semibold">{item.track.name}</div>
              <div className="text-sm text-gray-600">{item.track.artists?.map(a => a.name).join(", ")}</div>
            </div>
            {/* Spotify Embed Widget Preview */}
            <iframe
              src={`https://open.spotify.com/embed/track/${item.track.id}`}
              width="100"
              height="60"
              frameBorder="0"
              allow="encrypted-media"
              title={item.track.name}
              style={{ borderRadius: 8 }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Playlist;