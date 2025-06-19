import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth.js";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);

  // --- Get token from URL ---
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

  // --- Search track/artist/album ---
  useEffect(() => {
    if (!token || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track,album,artist&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSearchResults(res.data.tracks?.items || []);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  // --- Get Top Artist Albums ---
  useEffect(() => {
    const fetchTopArtistAlbums = async () => {
      try {
        const artistRes = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=1", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const topArtist = artistRes.data.items[0];
        if (!topArtist) return;

        const albumsRes = await axios.get(
          `https://api.spotify.com/v1/artists/${topArtist.id}/albums?include_groups=album,single&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTopAlbums(albumsRes.data.items);
      } catch (err) {
        console.warn("Top artist albums fetch failed:", err);
      }
    };

    if (token) fetchTopArtistAlbums();
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
            <h1 className="text-2xl font-bold">🎵 Spotify Search</h1>
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
            className="w-full p-3 border rounded mb-6"
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-2">🔍 Search Results</h2>
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
                      <p className="text-gray-600">{track.artists.map(a => a.name).join(", ")}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <iframe
                      src={`https://open.spotify.com/embed/track/${track.id}`}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allowtransparency="true"
                      allow="encrypted-media"
                      title={track.name}
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Artist Albums */}
          {topAlbums.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">🔥 Albums dari Artis Favorit Kamu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topAlbums.map((album) => (
                  <div key={album.id} className="bg-white p-4 rounded shadow">
                    <img src={album.images[0]?.url} alt={album.name} className="w-full h-48 object-cover rounded" />
                    <div className="mt-3">
                      <h3 className="font-semibold text-lg">{album.name}</h3>
                      <p className="text-gray-500 text-sm">{album.artists.map(a => a.name).join(", ")}</p>
                    </div>
                    <div className="mt-2">
                      <iframe
                        src={`https://open.spotify.com/embed/album/${album.id}`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="encrypted-media"
                        title={album.name}
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
