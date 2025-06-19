import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createAuthUrl, getTokenFromCode } from "../auth";
import axios from "axios";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect to /login if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Handle Spotify login callback
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

  // Fetch top tracks, then extract unique albums
  useEffect(() => {
    if (!token) return;

    const fetchAlbumsFromTopTracks = async () => {
      try {
        const res = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks?limit=20",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const trackAlbums = res.data.items.map((track) => track.album);

        // Filter unique albums by album.id
        const uniqueAlbums = Array.from(
          new Map(trackAlbums.map((album) => [album.id, album])).values()
        );

        setAlbums(uniqueAlbums);
      } catch (err) {
        console.error("Fetch top tracks/albums error:", err);
        setError("Gagal mengambil album dari track kamu.");
      }
    };

    fetchAlbumsFromTopTracks();
  }, [token]);

  // Search logic (tidak berubah)
  useEffect(() => {
    if (!token || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(res.data.tracks.items);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

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
            <h1 className="text-2xl font-bold text-purple-700">🎵 Spotify App</h1>
            <div className="flex gap-4">
              <Link to="/player" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Go to Player
              </Link>
              <button onClick={handleLogout} className="text-red-500 underline">Logout</button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search track..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded mb-6"
          />

          {searchResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">🔍 Search Results</h2>
              <div className="space-y-4">
                {searchResults.map((track) => (
                  <div key={track.id} className="bg-white p-4 rounded shadow">
                    <div className="flex items-center gap-4">
                      <img src={track.album.images[0]?.url} alt={track.name} className="w-16 h-16 rounded" />
                      <div>
                        <h3 className="font-bold">{track.name}</h3>
                        <p className="text-sm text-gray-600">{track.artists.map((a) => a.name).join(", ")}</p>
                      </div>
                    </div>
                    <div className="mt-3">
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
            </div>
          )}

          {albums.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">⭐ Album from Your Top Tracks</h2>
              <div className="grid grid-cols-2 gap-4">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="bg-white rounded shadow p-3 hover:bg-gray-50 block"
                  >
                    <img src={album.images[0]?.url} alt={album.name} className="w-full rounded mb-2" />
                    <div className="font-bold">{album.name}</div>
                    <div className="text-sm text-gray-500">{album.artists.map(a => a.name).join(", ")}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 font-bold mb-4">{error}</div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;