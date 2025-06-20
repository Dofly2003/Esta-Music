import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Player from "./pages/player";
import Playlist from "./pages/playlist";
import Album from "./pages/album";
import Artist from "./pages/artist";

// Tambahkan import berikut:
import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";

import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MusicPlayerProvider>
        {/* Player global selalu tampil */}
        <GlobalAudioPlayer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<Player />} />
          <Route path="/playlist/:playlistId" element={<Playlist />} />
          <Route path="/album/:albumId" element={<Album />} />
          <Route path="/artist/:artistId" element={<Artist />} />
        </Routes>
      </MusicPlayerProvider>
    </BrowserRouter>
  </React.StrictMode>
);