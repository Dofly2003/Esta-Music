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
    </div>
  );
}

export default AlbumWithIframeAndPreview;
