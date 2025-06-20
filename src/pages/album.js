import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Komponen audio player dengan kontrol volume
function AudioPlayer({ src, volume }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      controls
      src={src}
      className="h-8"
      ref={audioRef}
    >
      Your browser does not support the audio element.
    </audio>
  );
}

function Album() {
  const { albumId } = useParams();
  const token = localStorage.getItem("spotify_token");
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(0.6);

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
  if (!album) return <div className="p-8 text-white">Memuat...</div>;

  return (
    <div className="fixed inset-0 w-full h-full bg-black font-sans">
      {/* Background Dekorasi */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-black to-[#1db954] opacity-95"></div>
        <svg className="absolute -top-40 -left-40 w-[600px] h-[600px] opacity-15" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="400" fill="#1db954" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-[480px] h-[480px] opacity-10" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="400" fill="#fff" />
        </svg>
        <span className="absolute left-24 top-20 text-5xl text-white/30 animate-bounce-slow">🎶</span>
        <span className="absolute right-36 bottom-12 text-6xl text-green-400/30 animate-bounce">🎹</span>
        <span className="absolute left-1/2 top-1/3 text-4xl text-white/40 animate-pulse">🎼</span>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-10">
        <Link
          to="/"
          className="text-green-300 hover:text-green-100 underline mb-4 font-semibold text-lg transition"
        >
          ← Kembali
        </Link>

        {/* 🎚️ Volume Control */}
        {/* <div className="mb-6 flex items-center gap-4">
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
          <span className="text-white">{Math.round(volume * 100)}%</span>
        </div> */}

        {/* Info Album */}
        <div className="flex items-center gap-8 mb-10 bg-white/80 rounded-2xl shadow-xl p-6 backdrop-blur-lg">
          <img
            src={album.images?.[0]?.url}
            alt={album.name}
            className="w-40 h-40 rounded-xl shadow-xl object-cover"
          />
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2">{album.name}</h1>
            <div className="text-gray-700 mb-3 text-lg">
              by{" "}
              {album.artists.map((a, i) => (
                <Link
                  key={a.id}
                  to={`/artist/${a.id}`}
                  className="font-semibold text-green-600 hover:underline"
                >
                  {a.name}{i < album.artists.length - 1 ? ", " : ""}
                </Link>
              ))}
            </div>
            <div className="text-gray-500 text-base">{album.total_tracks} tracks</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {album.genres?.map((genre, i) => (
                <span
                  key={genre + i}
                  className="bg-green-200/80 text-green-900 px-2 py-1 rounded-full text-xs mr-2"
                >
                  {genre}
                </span>
              ))}
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {album.release_date}
              </span>
            </div>
          </div>
        </div>

        {/* Embed Spotify Player */}
        <div className="mb-10 w-full max-w-2xl shadow-xl rounded-2xl overflow-hidden">
          <iframe
            src={`https://open.spotify.com/embed/album/${albumId}`}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title="Spotify Album Player"
            style={{ borderRadius: 18 }}
          ></iframe>
        </div>

        {/* Track List */}
        {/* <ol className="space-y-4 w-full max-w-2xl">
          {album.tracks.items.map((track, idx) => (
            <li key={track.id} className="bg-white/90 rounded-xl shadow flex items-center gap-4 p-4 hover:bg-green-50 transition">
              <span className="w-7 text-gray-400 font-bold text-lg">{idx + 1}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{track.name}</div>
                <div className="text-sm text-gray-600">
                  {track.artists.map((a, i) => (
                    <Link
                      key={a.id}
                      to={`/artist/${a.id}`}
                      className="hover:underline text-green-700"
                    >
                      {a.name}{i < track.artists.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </div>
              </div>
              {track.preview_url && (
                <AudioPlayer src={track.preview_url} volume={volume} />
              )}
            </li>
          ))}
        </ol> */}
      </div>

      <style>{`
        .animate-fadein { animation: fadein 1.2s cubic-bezier(.57,1.27,.44,.98); }
        @keyframes fadein { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: none; } }
        .animate-pop { animation: pop .6s cubic-bezier(.25,1.7,.5,1.2); }
        @keyframes pop { 0% { transform: scale(0.9); } 60% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-slow { animation: bounce 2.4s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
      `}</style>
    </div>
  );
}

export default Album;
