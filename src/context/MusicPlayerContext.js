import React, { createContext, useContext, useState, useRef } from "react";

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => useContext(MusicPlayerContext);

export const MusicPlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null); // Info lagu
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio());

    const playTrack = (track) => {
        if (track.preview_url) {
            audioRef.current.pause();
            audioRef.current = new Audio(track.preview_url);
            audioRef.current.play();
            setCurrentTrack(track);
            setIsPlaying(true);

            audioRef.current.onended = () => {
                setIsPlaying(false);
            };
        }
    };

    // Tambahan di context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser, sourceNode;

    const setupAnalyser = () => {
        if (!analyser) {
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            sourceNode = audioContext.createMediaElementSource(audio);
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);
        }
    };

    const getSoundLevel = () => {
        if (!analyser) return 0;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        return avg;
    };

    // expose getSoundLevel in context

    const togglePlayPause = () => {
        if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const stopTrack = () => {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentTrack(null);
    };

    return (
        <MusicPlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            togglePlayPause,
            stopTrack,
        }}>
            {children}
        </MusicPlayerContext.Provider>
    );
};
