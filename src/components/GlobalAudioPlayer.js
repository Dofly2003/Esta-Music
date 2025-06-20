import React from "react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

export default function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, audioRef, setIsPlaying } = useMusicPlayer();

  if (!currentTrack) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      background: "rgba(255,255,255,0.95)",
      borderRadius: 12,
      boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
      padding: 16,
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 280,
      maxWidth: 400
    }}>
      <img
        src={currentTrack.image}
        alt={currentTrack.title}
        style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold" }}>{currentTrack.title}</div>
        <div style={{ fontSize: 12, color: "#444" }}>{currentTrack.artist}</div>
      </div>
      <button onClick={togglePlay} style={{ fontSize: 24, border: "none", background: "none" }}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={() => setIsPlaying(false)}
        style={{ display: "none" }}
        autoPlay
      />
    </div>
  );
}