import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

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
        setInfo("");
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

  // Fetch trending albums (misal dari featured playlists atau new releases lain)
  useEffect(() => {
    if (!token) return;
    axios
      .get("https://api.spotify.com/v1/browse/new-releases?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTrendingAlbums(res.data.albums.items || []);
      })
      .catch(() => setTrendingAlbums([]));
  }, [token]);

  // Search logic (DIPERBAIKI: album/artist clickable)
  useEffect(() => {
    if (!token || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=album,artist,track&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Gabungkan hasil album, artist, dan track
        const albums = res.data.albums ? res.data.albums.items : [];
        const artists = res.data.artists ? res.data.artists.items : [];
        const tracks = res.data.tracks ? res.data.tracks.items : [];
        setSearchResults([
          ...albums.map(a => ({ ...a, _type: "album" })),
          ...artists.map(a => ({ ...a, _type: "artist" })),
          ...tracks.map(a => ({ ...a, _type: "track" })),
        ]);
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

  // Redirect logic for album or artist from search
  const handleSearchClick = (item) => {
    if (item._type === "album") {
      navigate(`/album/${item.id}`);
    } else if (item._type === "artist") {
      navigate(`/artist/${item.id}`);
    }
    // For track: navigate to album page
    else if (item._type === "track" && item.album?.id) {
      navigate(`/album/${item.album.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!token ? (
        <div className="flex justify-center items-center h-screen bg-black text-white">
          <button
            onClick={handleLogin}
            className="bg-green-500 px-6 py-3 rounded-lg text-lg font-bold hover:bg-green-600"
          >
            Login with Spotify account 
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-purple-700">🎵 Esta Music App</h1>
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
              <button onClick={handleLogout} className="text-red-500 underline">Logout</button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search track, album, or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded mb-6"
          />

          {searchResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">🔍 Search Results</h2>
              <div className="space-y-4">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSearchClick(item)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.images?.[0]?.url
                          || item.album?.images?.[0]?.url
                          || "/default-avatar.png"
                        }
                        alt={item.name || item.title}
                        className="w-16 h-16 rounded"
                      />
                      <div>
                        <h3 className="font-bold">
                          {item.name || item.title}
                          {item._type === "album" && <span className="ml-2 text-xs bg-green-200 text-green-900 px-2 rounded">Album</span>}
                          {item._type === "artist" && <span className="ml-2 text-xs bg-blue-200 text-blue-900 px-2 rounded">Artist</span>}
                          {item._type === "track" && <span className="ml-2 text-xs bg-purple-200 text-purple-900 px-2 rounded">Track</span>}
                        </h3>
                        {item.artists && (
                          <p className="text-sm text-gray-600">
                            {item.artists.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        {item._type === "artist" && (
                          <p className="text-sm text-gray-600">{item.genres && item.genres.join(", ")}</p>
                        )}
                      </div>
                    </div>
                    {/* Track preview if type is track */}
                    {item._type === "track" && (
                      <div className="mt-3">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${item.id}`}
                          width="100%"
                          height="80"
                          frameBorder="0"
                          allow="encrypted-media"
                          title={item.name}
                        ></iframe>
                      </div>
                    )}
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

              {/* Section Tren */}
              {trendingAlbums.length > 0 && (
                <>
                  <h2 className="text-xl font-bold mt-12 mb-4">🔥 Albums Sedang Tren</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {trendingAlbums.map((album) => (
                      <div key={album.id} className="bg-white rounded-lg shadow flex flex-col items-center p-3 hover:bg-gray-50 transition">
                        <img src={album.images?.[0]?.url} alt={album.name} className="w-32 h-32 object-cover rounded mb-2" />
                        <div className="font-bold text-center">{album.name}</div>
                        <div className="text-sm text-gray-500 text-center">{album.artists?.map(a => a.name).join(", ")}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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