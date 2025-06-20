import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useMusicPlayer } from "../context/MusicPlayerContext"; // <--- Tambahkan ini

function Artist() {
    const { artistId } = useParams();
    const token = localStorage.getItem("spotify_token");
    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const { playTrack, currentTrack, isPlaying } = useMusicPlayer(); // <-- Tambahkan ini

    useEffect(() => {
        if (!token) return;

        axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setArtist(res.data));

        axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ID`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setTracks(res.data.tracks));
    }, [artistId, token]);

    if (!artist) return <div className="text-white p-8">Memuat artist...</div>;

    return (
        <div className="min-h-screen relative text-white px-4 py-10 font-sans">

            {/* Background dari gambar artist */}
            {artist.images[0]?.url && (
                <div
                    className="fixed inset-0 -z-10 bg-cover bg-center blur-sm brightness-50"
                    style={{ backgroundImage: `url(${artist.images[0].url})` }}
                ></div>
            )}

            <Link to="/" className="text-green-300 hover:text-green-100 underline mb-4 font-semibold text-lg transition">
                ← Kembali
            </Link>

            {/* Header Artist */}
            <div className="text-center mb-10 flex flex-col items-center gap-4">
                {artist.images[0]?.url && (
                    <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-36 h-36 rounded-full border-4 border-white shadow-lg"
                    />
                )}
                <h1 className="text-4xl font-bold">{artist.name}</h1>
                <p className="text-gray-300">{artist.followers.total.toLocaleString()} followers</p>
            </div>

            {/* Embed Spotify */}
            <div className="w-full max-w-2xl mx-auto mb-10">
                <iframe
                    src={`https://open.spotify.com/embed/artist/${artistId}`}
                    width="100%"
                    height="400"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="rounded-xl shadow-lg"
                    title="Spotify Artist Player"
                ></iframe>
                <p className="text-sm text-gray-400 text-center mt-2">
                    Untuk mengatur volume, gunakan slider volume di pengaturan suara perangkat atau popup player di bawah.
                </p>
            </div>

            {/* Track List */}
            <div className="max-w-3xl mx-auto">
                {tracks.map((track, index) => (
                    <div
                        key={track.id}
                        className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-4 flex items-center justify-between hover:bg-white/20 transition"
                    >
                        <div className="flex-1">
                            <div className="font-bold text-lg">{index + 1}. {track.name}</div>
                            <div className="text-sm text-gray-300">{track.artists.map(a => a.name).join(", ")}</div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Tombol Play yang trigger global player */}
                            {track.preview_url ? (
                                <button
                                    onClick={() =>
                                        playTrack({
                                            url: track.preview_url,
                                            title: track.name,
                                            artist: track.artists.map(a => a.name).join(", "),
                                            image: (track.album?.images?.[0]?.url || artist.images[0]?.url),
                                        })
                                    }
                                    className={`px-3 py-1 rounded-full text-white font-semibold bg-green-500 hover:bg-green-700 transition`}
                                >
                                    {(currentTrack && currentTrack.url === track.preview_url && isPlaying)
                                        ? "Pause"
                                        : "Play"}
                                </button>
                            ) : (
                                <span className="text-gray-400 italic text-sm">Preview tidak tersedia</span>
                            )}
                            <div className="text-sm text-gray-300">
                                {Math.floor(track.duration_ms / 60000)}:
                                {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Artist;