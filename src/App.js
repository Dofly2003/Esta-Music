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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // --- Exchange Code for Token ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !token) {
      getTokenFromCode(code).then((newToken) => {
        console.log("✅ New token received:", newToken);

        if (newToken) {
          localStorage.setItem("spotify_token", newToken);
          setToken(newToken);
          window.history.replaceState({}, document.title, "/");
        } else {
          console.warn("❌ Token gagal didapat. Mungkin code sudah expired.");
          localStorage.removeItem("spotify_token");
          localStorage.removeItem("spotify_code_verifier");
          window.location.href = "/";
        }
      });

    }
  }, [token]);

  // --- Fetch Top Artists & Tracks ---
  useEffect(() => {
    const fetchTop = async () => {
      try {
        const [artistRes, trackRes] = await Promise.all([
          axios.get("https://api.spotify.com/v1/me/top/artists?limit=5", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://api.spotify.com/v1/me/top/tracks?limit=5", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setArtists(artistRes.data.items);
        setTracks(trackRes.data.items);
      } catch (err) {
        console.error("Fetch top error:", err);
        localStorage.removeItem("spotify_token");
        setToken("");
      }
    };
    if (token) fetchTop();
  }, [token]);

  // --- Spotify Player Setup ---
  useEffect(() => {
    if (!token || player || isPlayerReady.current) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Web Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        isPlayerReady.current = true;
        transferPlaybackHere(device_id, token);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (state?.track_window?.current_track) {
          setNowPlaying(state.track_window.current_track);
        }
      });

      spotifyPlayer.addListener("initialization_error", ({ message }) => console.error(message));
      spotifyPlayer.addListener("authentication_error", ({ message }) => console.error(message));

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };
  }, [token, player]);

  // --- Transfer Playback ---
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

  // --- Play Track ---
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

  // --- Search Spotify ---
  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track,artist,album&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSearchResults(res.data.tracks?.items || []);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    const timeout = setTimeout(fetchSearch, 500); // debounce
    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  // --- Handle Login ---
  const handleLogin = async () => {
    const authUrl = await createAuthUrl();
    window.location.href = authUrl;
  };

  // --- Handle Logout ---
  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    setToken("");
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
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">🎧 Spotify Dashboard</h1>
        <button onClick={handleLogout} className="text-red-500 underline">Logout</button>
      </div>

      {/* --- Search Input --- */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for songs, albums, or artists..."
        className="w-full p-2 mb-6 border rounded"
      />

      {/* --- Search Results --- */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">🔍 Search Results</h2>
          <ul className="space-y-4 mb-8">
            {searchResults.map((track) => (
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
        </div>
      )}

      {/* --- Top Artists --- */}
      <h2 className="text-xl font-bold mb-4">🔥 Top Artists</h2>
      <ul className="space-y-4 mb-8">
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

      {/* --- Top Tracks --- */}
      <h2 className="text-xl font-bold mb-4">🎵 Top Tracks</h2>
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

      {/* --- Now Playing --- */}
      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center gap-4 shadow">
          <img src={nowPlaying.album.images[0]?.url} alt={nowPlaying.name} className="w-12 h-12 rounded" />
          <div>
            <div className="font-semibold">{nowPlaying.name}</div>
            <div className="text-sm text-gray-500">{nowPlaying.artists.map(a => a.name).join(", ")}</div>
          </div>
        </div>
      )}

      <p className="mt-6 text-gray-600 text-sm">Note: Requires Spotify Premium for playback.</p>
    </div>
  );
}

export default App;
