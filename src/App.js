import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { createAuthUrl, getTokenFromCode } from "./auth.js";

function App() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);
  const isPlayerReady = useRef(false);

  // --- Handle Auth Code Exchange for Token ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !token) {
      getTokenFromCode(code).then((newToken) => {
        if (newToken) setToken(newToken);
        window.history.replaceState({}, document.title, "/"); // bersihkan URL
      });
    }
  }, [token]);

  // --- Fetch Top Artists ---
  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtists(res.data.items);
      } catch (err) {
        console.error("Token error:", err);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };
    if (token) fetchTopArtists();
  }, [token]);

  // --- Fetch Top Tracks ---
  useEffect(() => {
    const fetchTopTracks = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTracks(res.data.items);
      } catch (err) {
        console.error("Track fetch error:", err);
      }
    };
    if (token) fetchTopTracks();
  }, [token]);

  // --- Spotify Web Playback SDK ---
  useEffect(() => {
    if (!token || player || isPlayerReady.current) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Web Player",
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        isPlayerReady.current = true;
        // Transfer playback to this device
        transferPlaybackHere(device_id, token);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (state && state.track_window && state.track_window.current_track) {
          setNowPlaying(state.track_window.current_track);
        }
      });

      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error(message);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };
  }, [token, player]);

  // --- Helper: Transfer Playback ---
  async function transferPlaybackHere(deviceId, token) {
    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false
      })
    });
  }

  // --- Helper: Play Track ---
  async function playTrack(uri) {
    if (!deviceId) {
      alert("Player belum siap.");
      return;
    }
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uris: [uri] })
      }
    );
  }

  // --- Auth Button ---
  const handleLogin = async () => {
    const authUrl = await createAuthUrl();
    window.location.href = authUrl;
  };

  // --- UI ---
  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <button
          onClick={handleLogin}
          className="bg-green-500 px-6 py-3 rounded-lg text-lg font-bold hover:bg-green-600"
        >
          Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">🎧 Top Artists</h1>
      <ul className="space-y-4">
        {artists.map((artist) => (
          <li key={artist.id} className="flex items-center gap-4 bg-white p-4 rounded shadow">
            <img src={artist.images[0]?.url} alt={artist.name} className="w-16 h-16 rounded-full" />
            <div>
              <div className="font-medium text-lg">{artist.name}</div>
              <div className="text-sm text-gray-500">Genre: {artist.genres?.[0]}</div>
            </div>
          </li>
        ))}
      </ul>

      <h1 className="text-2xl font-bold mt-8 mb-4">🎵 Top Tracks</h1>
      <ul className="space-y-4">
        {tracks.map((track) => (
          <li key={track.id} className="flex items-center gap-4 bg-white p-4 rounded shadow">
            <img src={track.album.images[0]?.url} alt={track.name} className="w-16 h-16 rounded" />
            <div>
              <div className="font-medium text-lg">{track.name}</div>
              <div className="text-sm text-gray-500">{track.artists.map(a => a.name).join(", ")}</div>
            </div>
            <button
              className="ml-auto px-3 py-1 rounded bg-green-500 text-white font-bold hover:bg-green-600"
              onClick={() => playTrack(track.uri)}
              disabled={!deviceId}
            >
              ▶ Play
            </button>
          </li>
        ))}
      </ul>

      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center gap-4 shadow">
          <img src={nowPlaying.album.images[0]?.url} alt={nowPlaying.name} className="w-12 h-12 rounded" />
          <div>
            <div className="font-semibold">{nowPlaying.name}</div>
            <div className="text-sm text-gray-500">{nowPlaying.artists.map(a => a.name).join(", ")}</div>
          </div>
        </div>
      )}

      <p className="mt-6 text-gray-600 text-sm">Note: Web playback requires a Spotify Premium account.</p>
    </div>
  );
}

export default App;