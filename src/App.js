import React, { useEffect, useState } from "react";
import axios from "axios";
import { createAuthUrl } from "./auth.js";

function App() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [artists, setArtists] = useState([]);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ambil token dari URL saat login
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const tokenFromUrl = new URLSearchParams(hash.substring(1)).get("access_token");
      localStorage.setItem("spotify_token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.location.hash = "";
    }
  }, []);

  // ambil top artist dan lagu dari Spotify
  useEffect(() => {
    if (!token) return;

    const fetchTopArtists = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=5", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const artistsWithTracks = await Promise.all(
          res.data.items.map(async (artist) => {
            const tracksRes = await axios.get(
              `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=ID`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // SHUFFLE lokal:
            const shuffled = tracksRes.data.tracks
              .filter((t) => t.preview_url)
              .sort(() => 0.5 - Math.random())
              .slice(0, 5);

            return {
              name: artist.name,
              image: artist.images[0]?.url,
              tracks: shuffled,
            };
          })
        );

        setArtists(artistsWithTracks);
      } catch (error) {
        console.error("Gagal ambil data", error);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };

    fetchTopArtists();
  }, [token]);

  const playPreview = (previewUrl) => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }

    const newAudio = new Audio(previewUrl);
    newAudio.play();
    setAudio(newAudio);
    setIsPlaying(true);

    newAudio.onended = () => setIsPlaying(false);
  };

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <button
          onClick={async () => {
            const authUrl = await createAuthUrl();
            window.location.href = authUrl;
          }}
          className="bg-green-500 px-6 py-3 rounded text-lg font-bold hover:bg-green-600"
        >
          Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🎶 Top Artists & Shuffle Songs</h1>

      <div className="grid gap-10">
        {artists.map((artist, i) => (
          <div key={i}>
            <div className="flex items-center gap-4 mb-2">
              <img src={artist.image} alt={artist.name} className="w-20 h-20 rounded-full" />
              <h2 className="text-xl font-semibold">{artist.name}</h2>
            </div>

            <div className="grid gap-4 ml-6">
              {artist.tracks.map((track) => (
                <div key={track.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={track.album.images[0]?.url} alt="" className="w-12 h-12 rounded" />
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-sm text-gray-600">
                        {track.artists.map((a) => a.name).join(", ")}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => playPreview(track.preview_url)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                  >
                    ▶ Preview
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
