import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // Tambahan: info untuk album random
  const [user, setUser] = useState(null); // Tambahan: user info

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

  // Fetch user profile
  useEffect(() => {
    if (!token) return;
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [token]);

  // Fetch top tracks, fallback ke random album jika gagal/kosong
  useEffect(() => {
    if (!token) return;
    const fetchAlbumsFromTopTracks = async () => {
      try {
        const res = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks?limit=20",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.data.items || res.data.items.length === 0) {
          setInfo("Top tracks tidak ditemukan, menampilkan album random.");
          fetchRandomAlbums();
          return;
        }
        const trackAlbums = res.data.items.map((track) => track.album);
        const uniqueAlbums = Array.from(
          new Map(trackAlbums.map((album) => [album.id, album])).values()
        );
        setAlbums(uniqueAlbums);
        setInfo(""); // Reset info jika dapat top tracks
      } catch (err) {
        setInfo("Top tracks tidak ditemukan, menampilkan album random.");
        fetchRandomAlbums();
      }
    };

    // Fungsi ambil album random (new releases)
    const fetchRandomAlbums = async () => {
      try {
        const res = await axios.get(
          "https://api.spotify.com/v1/browse/new-releases?limit=12",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlbums(res.data.albums.items);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Akses ditolak. Silakan logout lalu login ulang dan izinkan akses ke Spotify Top Tracks.");
        } else {
          setError(
            "Gagal mengambil album dari track kamu. " +
            (err.response?.data?.error?.message || err.message)
          );
        }
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
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-purple-700">🎵 Spotify App</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded shadow">
                  <img
                    src={user.images?.[0]?.url || "/default-avatar.png"}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="font-medium">{user.display_name}</span>
                </div>
              )}
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
              <h2 className="text-xl font-bold mb-4">
                {info ? "⭐ Album Random" : "⭐ Album from Your Top Tracks"}
              </h2>
              {info && <div className="mb-2 text-yellow-700 font-semibold">{info}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {albums.slice(0, 5).map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="bg-white rounded-lg shadow flex flex-col items-center p-3 hover:bg-gray-50 transition"
                  >
                    <img
                      src={album.images[0]?.url}
                      alt={album.name}
                      className="w-36 h-36 object-cover rounded mb-2"
                    />
                    <div className="font-bold text-center">{album.name}</div>
                    <div className="text-sm text-gray-500 text-center">
                      {album.artists?.map(a => a.name).join(", ")}
                    </div>
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