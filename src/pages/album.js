import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function AlbumWithIframeAndPreview() {
  const { albumId } = useParams();
  const token = localStorage.getItem("spotify_token");
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [currentPreview, setCurrentPreview] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (!token) return;
    axios
      .get(`https://api.spotify.com/v1/albums/${albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAlbum(res.data))
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat album.");
      });

    return () => {
      audioRef.current.pause();
    };
  }, [albumId, token]);

  const handlePlay = (track) => {
    if (currentPreview?.id === track.id) {
      audioRef.current.pause();
      setCurrentPreview(null);
      return;
    }

    audioRef.current.src = track.preview_url;
    audioRef.current.play();
    setCurrentPreview(track);
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-4">Preview & Spotify Iframe</h1>

      {/* IFRAME Spotify */}
      <div className="mb-8">
        <iframe
          src={`https://open.spotify.com/embed/album/${albumId}`}
          width="100%"
          height="380"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title="Spotify Iframe"
          className="rounded-xl shadow-xl"
        ></iframe>
      </div>

      {/* AUDIO Preview List */}
      {error && <div className="text-red-500">{error}</div>}
      {!album ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-3">{album.name} - Track Preview</h2>
          <ul className="space-y-3">
            {album.tracks.items.map((track, i) => (
              <li
                key={track.id}
                className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{i + 1}. {track.name}</div>
                  <div className="text-sm text-gray-300">
                    {track.artists.map((a) => a.name).join(", ")}
                  </div>
                </div>
                {track.preview_url ? (
                  <button
                    onClick={() => handlePlay(track)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-full"
                  >
                    {currentPreview?.id === track.id ? "Pause" : "Play"}
                  </button>
                ) : (
                  <span className="text-gray-400 italic text-sm">No preview</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Floating Audio Player */}
      {currentPreview && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-black px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
          <img
            src={album.images?.[0]?.url}
            alt="cover"
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <div className="font-bold">{currentPreview.name}</div>
            <div className="text-sm text-gray-600">
              {currentPreview.artists.map((a) => a.name).join(", ")}
            </div>
          </div>
          <button
            onClick={() => {
              audioRef.current.pause();
              setCurrentPreview(null);
            }}
            className="ml-auto bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default AlbumWithIframeAndPreview;
