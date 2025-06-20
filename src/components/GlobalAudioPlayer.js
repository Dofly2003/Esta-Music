import React from "react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, stopTrack } = useMusicPlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white/90 text-black shadow-xl rounded-xl px-4 py-3 flex items-center gap-4 z-50 w-[300px]">
      <img
        src={currentTrack.album?.images?.[0]?.url}
        alt={currentTrack.name}
        className="w-12 h-12 rounded-lg"
      />
      <div className="flex-1">
        <div className="font-bold text-sm">{currentTrack.name}</div>
        <div className="text-xs text-gray-600">{currentTrack.artists.map(a => a.name).join(", ")}</div>
      </div>
      <button onClick={togglePlayPause} className="text-xl">
        {isPlaying ? "⏸" : "▶️"}
      </button>
      <button onClick={stopTrack} className="text-lg text-red-600 font-bold">✖</button>
    </div>
  );
}

export default GlobalAudioPlayer;
