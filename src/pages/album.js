// src/pages/album.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Album() {
  const { albumId } = useParams();
  const token = localStorage.getItem("spotify_token");
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setAlbum(res.data))
      .catch(err => {
        console.error(err);
        setError("Gagal memuat album.");
      });
  }, [albumId, token]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!album) return <div className="p-8">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link to="/" className="text-blue-500 underline mb-4 inline-block">← Kembali</Link>
      <div className="flex items-center gap-6 mb-8">
        <img src={album.images?.[0]?.url} alt={album.name} className="w-32 h-32 rounded" />
        <div>
          <h1 className="text-3xl font-bold">{album.name}</h1>
          <div className="text-gray-600 mb-2">by {album.artists.map(a => a.name).join(", ")}</div>
          <div className="text-gray-500">{album.total_tracks} tracks</div>
        </div>
      </div>

      <ol className="space-y-4">
        {album.tracks.items.map((track, idx) => (
          <li key={track.id} className="bg-white rounded shadow p-4 flex items-center gap-4">
            <span className="w-6 text-gray-400">{idx + 1}</span>
            <div className="flex-1">
              <div className="font-semibold">{track.name}</div>
              <div className="text-sm text-gray-600">{track.artists.map(a => a.name).join(", ")}</div>
            </div>
            <iframe
              src={`https://open.spotify.com/embed/track/${track.id}`}
              width="100"
              height="60"
              frameBorder="0"
              allow="encrypted-media"
              title={track.name}
              style={{ borderRadius: 8 }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Album;
