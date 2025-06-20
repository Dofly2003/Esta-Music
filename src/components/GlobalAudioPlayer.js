import React from "react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

export default function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, audioRef, setIsPlaying } = useMusicPlayer();

  if (!currentTrack) return null; // Belum ada lagu

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 rounded-xl shadow-xl px-6 py-3 flex items-center gap-4 w-[350px]">
      <img src={currentTrack.image} alt={currentTrack.title} className="w-12 h-12 rounded-lg" />
      <div className="flex-1">
        <div className="font-bold">{currentTrack.title}</div>
        <div className="text-sm text-gray-600">{currentTrack.artist}</div>
      </div>
      <button onClick={togglePlay} className="text-2xl">
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