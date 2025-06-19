import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Fungsi shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Album() {
  const { albumId } = useParams();
  const token = localStorage.getItem("spotify_token");
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

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

  // Play all handler
  const handlePlayAll = (shuffle = false) => {
    if (!album) return;
    const tracksWithPreview = album.tracks.items.filter(track => track.preview_url);
    if (tracksWithPreview.length === 0) {
      alert("Tidak ada track dengan preview di album ini.");
      return;
    }
    const queue = shuffle ? shuffleArray(tracksWithPreview) : tracksWithPreview;
    setPlayQueue(queue);
    setCurrentTrackIndex(0);
    setIsShuffling(shuffle);
    setIsPlaying(true);
  };

  // Play next track automatically
  useEffect(() => {
    if (!isPlaying || playQueue.length === 0) return;
    audioRef.current?.play();
  }, [isPlaying, playQueue, currentTrackIndex]);

  const handleEnded = () => {
    if (currentTrackIndex + 1 < playQueue.length) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setIsPlaying(false);
      setCurrentTrackIndex(0);
      setPlayQueue([]);
    }
  };

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

      {/* Tombol Play All dan Shuffle */}
      <div className="mb-6 flex gap-3">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
          onClick={() => handlePlayAll(false)}
          disabled={isPlaying && !isShuffling}
        >
          ▶️ Play All
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold"
          onClick={() => handlePlayAll(true)}
          disabled={isPlaying && isShuffling}
        >
          🔀 Shuffle Play
        </button>
        {isPlaying && playQueue[currentTrackIndex] && (
          <span className="ml-4 font-bold text-green-800">
            Now Playing: {playQueue[currentTrackIndex].name}
          </span>
        )}
      </div>

      {/* Audio player */}
      {isPlaying && playQueue[currentTrackIndex] && (
        <audio
          ref={audioRef}
          src={playQueue[currentTrackIndex].preview_url}
          autoPlay
          controls
          onEnded={handleEnded}
          className="mb-6 w-full"
        />
      )}

      <ol className="space-y-4">
        {album.tracks.items.map((track, idx) => (
          <li key={track.id} className="bg-white rounded shadow p-4 flex items-center gap-4">
            <span className="w-6 text-gray-400">{idx + 1}</span>
            <div className="flex-1">
              <div className="font-semibold">{track.name}</div>
              <div className="text-sm text-gray-600">{track.artists.map(a => a.name).join(", ")}</div>
            </div>
            {track.preview_url ? (
              <audio src={track.preview_url} controls preload="none" style={{ width: 100 }} />
            ) : (
              <span className="text-xs text-gray-400">No Preview</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Album;