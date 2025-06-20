import React, { createContext, useContext, useState, useRef } from "react";

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null); // 👈 inisialisasi Audio ref

  const playTrack = (track) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const newAudio = new Audio(track.url);
    audioRef.current = newAudio;

    newAudio.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack(track);
    });

    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => useContext(MusicPlayerContext);
