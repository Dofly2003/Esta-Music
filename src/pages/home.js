import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth";
import axios from "axios";
import { Link } from "react-router-dom";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !token) {
      getTokenFromCode(code).then((newToken) => {
        if (newToken) {
          localStorage.setItem("spotify_token", newToken);
          setToken(newToken);
        }
        window.history.replaceState({}, document.title, "/");
      });
    }
  }, [token]);

  // Search logic
  useEffect(() => {
    if (!token || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const shuffledTracks = shuffleArray(res.data.tracks?.items || []);
        setSearchResults(shuffledTracks);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  // Ambil top artists dan album/playlist mereka
  useEffect(() => {
    if (!token) return;

    const fetchTopData = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=2", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopArtists(res.data.items);

        const allAlbums = [];
        const allPlaylists = [];

        for (const artist of res.data.items) {
          const albumsRes = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=2`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allAlbums.push(...albumsRes.data.items);

          const playlistsRes = await axios.get(`https://api.spotify.com/v1/search?q=${artist.name}&type=playlist&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allPlaylists.push(...playlistsRes.data.playlists.items);
        }

        setAlbums(allAlbums);
        setPlaylists(allPlaylists);
      } catch (err) {
        console.error("Top artist/albums error:", err);
      }
    };

    fetchTopData();
  }, [token]);

  const handleLogin = async () => {
    const authUrl = await createAuthUrl();
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    setToken("");
    setSearchResults([]);
  };

  const handleShuffle = () => {
    setSearchResults(shuffleArray(searchResults));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!token ? (
        <div className="flex justify-center items-center h-screen bg-black text-white">
          <button
            onClick={handleLogin}
            className="bg-green-500 px-6 py-3 rounded-lg text-lg font-bold hover:bg-green-600"
          >
            Login with Spotify
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-700">🎵 Spotify Search</h1>
            <div className="flex gap-4">
              <Link to="/player" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Go to Player
              </Link>
              <button onClick={handleLogout} className="text-red-500 underline">Logout</button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search album, artist, or song..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          />

          {searchResults.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleShuffle}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                🔀 Shuffle Tracks
              </button>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-6 mb-10">
            {searchResults.map((track) => (
              <div key={track.id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center gap-4">
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <h2 className="font-bold text-lg">{track.name}</h2>
                    <p className="text-gray-600">{track.artists.map((a) => a.name).join(", ")}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${track.id}`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="encrypted-media"
                    title={track.name}
                  ></iframe>
                </div>
              </div>
            ))}
          </div>

          {/* Top Artist Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">🔥 Albums from Your Favorite Artists</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {albums.map((album) => (
                <a
                  href={`https://open.spotify.com/album/${album.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={album.id}
                  className="bg-white rounded shadow p-3 hover:bg-gray-50 transition"
                >
                  <img src={album.images[0]?.url} alt={album.name} className="w-full rounded mb-2" />
                  <div className="font-bold">{album.name}</div>
                  <div className="text-sm text-gray-500">{album.artists.map(a => a.name).join(", ")}</div>
                </a>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4">🎧 Playlists Inspired by Your Artists</h2>
            <div className="grid grid-cols-2 gap-4">
              {playlists.map((playlist) => (
                <a
                  href={`https://open.spotify.com/playlist/${playlist.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={playlist.id}
                  className="bg-white rounded shadow p-3 hover:bg-gray-50 transition"
                >
                  <img src={playlist.images[0]?.url} alt={playlist.name} className="w-full rounded mb-2" />
                  <div className="font-bold">{playlist.name}</div>
                  <div className="text-sm text-gray-500">by {playlist.owner.display_name}</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
