import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Artist() {
  const { artistId } = useParams();
  const token = localStorage.getItem("spotify_token");
  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchArtistAndTracks = async () => {
      try {
        const artistRes = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtist(artistRes.data);

        const albumRes = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const albumIds = [...new Set(albumRes.data.items.map((a) => a.id))];
        const allTrackRes = await Promise.all(
          albumIds.map((id) =>
            axios.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const allTracks = allTrackRes.flatMap(res => res.data.items);
        setTracks(allTracks);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data artis.");
        setLoading(false);
      }
    };

    fetchArtistAndTracks();
  }, [artistId, token]);

  if (loading) return <div className="p-8 text-white">Memuat...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <Link to="/" className="text-green-400 underline mb-6 block">← Kembali</Link>
      {artist && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">{artist.name}</h1>
          <p className="text-gray-400">{artist.followers.total.toLocaleString()} followers</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">🎵 Semua Lagu</h2>
      <ul className="space-y-4">
        {tracks.map((track) => (
          <li key={track.id} className="bg-white/10 p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">{track.name}</div>
              <div className="text-sm text-gray-300">
                {track.artists.map((a) => a.name).join(", ")}
              </div>
            </div>
            {track.preview_url && (
              <audio controls src={track.preview_url} className="h-8">
                Browser tidak mendukung audio.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Artist;
