import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

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

  useEffect(() => {
    if (!token) return;
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchTopArtists = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopArtists(res.data.items);
      } catch {
        setTopArtists([]);
      }
    };

    const fetchAlbumsFromTopTracks = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=20", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data.items || res.data.items.length === 0) {
          setInfo("Top tracks tidak ditemukan, menampilkan album random.");
          fetchRandomAlbums();
          return;
        }
        const trackAlbums = res.data.items.map((track) => track.album);
        const uniqueAlbums = Array.from(new Map(trackAlbums.map((album) => [album.id, album])).values());
        setAlbums(uniqueAlbums);
        setInfo("");
      } catch (err) {
        setInfo("Top tracks tidak ditemukan, menampilkan album random.");
        fetchRandomAlbums();
      }
    };

    const fetchRandomAlbums = async () => {
      try {
        const res = await axios.get("https://api.spotify.com/v1/browse/new-releases?limit=12", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlbums(res.data.albums.items);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Akses ditolak. Silakan logout lalu login ulang dan izinkan akses ke Spotify Top Tracks.");
        } else {
          setError("Gagal mengambil album dari track kamu. " + (err.response?.data?.error?.message || err.message));
        }
      }
    };

    fetchTopArtists();
    fetchAlbumsFromTopTracks();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios
      .get("https://api.spotify.com/v1/browse/new-releases?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTrendingAlbums(res.data.albums.items || []))
      .catch(() => setTrendingAlbums([]));
  }, [token]);

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
        const albums = res.data.albums ? res.data.albums.items : [];
        const artists = res.data.artists ? res.data.artists.items : [];
        const tracks = res.data.tracks ? res.data.tracks.items : [];
        setSearchResults([
          ...albums.map((a) => ({ ...a, _type: "album" })),
          ...artists.map((a) => ({ ...a, _type: "artist" })),
          ...tracks.map((a) => ({ ...a, _type: "track" })),
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

  const handleSearchClick = (item) => {
    if (item._type === "album") navigate(`/album/${item.id}`);
    else if (item._type === "artist") navigate(`/artist/${item.id}`);
    else if (item._type === "track" && item.album?.id) navigate(`/album/${item.album.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="p-4">
        {!token ? (
          <div className="text-center mt-20">
            <h1 className="text-4xl font-bold mb-4">Welcome to Spotify App</h1>
            <button onClick={handleLogin} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
              Login with Spotify
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Hello, {user?.display_name || "User"}</h1>
              <button onClick={handleLogout} className="text-red-400 underline">Logout</button>
            </div>

            <input
              type="text"
              placeholder="Search album, artist, or track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg mb-6 text-black"
            />

            {searchResults.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-3">🔍 Search Results</h2>
                <ul className="space-y-2">
                  {searchResults.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => handleSearchClick(item)}
                      className="cursor-pointer bg-white/10 px-4 py-3 rounded-lg hover:bg-white/20"
                    >
                      {item.name} <span className="text-sm text-gray-400 ml-2">({item._type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topArtists.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">🎤 Top Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {topArtists.map((artist) => (
                    <Link
                      key={artist.id}
                      to={`/artist/${artist.id}`}
                      className="bg-white/90 p-4 rounded-xl shadow flex flex-col items-center hover:bg-green-50 transition"
                    >
                      <img
                        src={artist.images?.[0]?.url || "/default-avatar.png"}
                        alt={artist.name}
                        className="w-28 h-28 object-cover rounded-full mb-2"
                      />
                      <div className="font-bold text-gray-900 text-center">{artist.name}</div>
                      <div className="text-sm text-gray-500">{artist.genres?.[0]}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {albums.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">⭐ {info ? "Random Albums" : "Albums from Your Top Tracks"}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {albums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/album/${album.id}`}
                      className="bg-white/90 p-4 rounded-xl shadow flex flex-col items-center hover:bg-green-50 transition"
                    >
                      <img
                        src={album.images?.[0]?.url}
                        alt={album.name}
                        className="w-28 h-28 object-cover rounded-xl mb-2"
                      />
                      <div className="font-bold text-gray-900 text-center">{album.name}</div>
                      <div className="text-sm text-gray-500">{album.artists?.map((a) => a.name).join(", ")}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {trendingAlbums.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">🔥 Trending Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {trendingAlbums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/album/${album.id}`}
                      className="bg-white/90 p-4 rounded-xl shadow flex flex-col items-center hover:bg-green-50 transition"
                    >
                      <img
                        src={album.images?.[0]?.url}
                        alt={album.name}
                        className="w-28 h-28 object-cover rounded-xl mb-2"
                      />
                      <div className="font-bold text-gray-900 text-center">{album.name}</div>
                      <div className="text-sm text-gray-500">{album.artists?.map((a) => a.name).join(", ")}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="text-red-500 mt-4">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
