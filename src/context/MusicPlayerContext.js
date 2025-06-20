import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const MusicPlayerContext = createContext();

export function MusicPlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef();

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  return (
    <MusicPlayerContext.Provider value={{
      currentTrack, isPlaying, playTrack, togglePlay, audioRef, setIsPlaying
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}