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

  // === LOGIC TETAP ===
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
  const handleSearchClick = (item) => {
    if (item._type === "album") navigate(`/album/${item.id}`);
    else if (item._type === "artist") navigate(`/artist/${item.id}`);
    else if (item._type === "track" && item.album?.id) navigate(`/album/${item.album.id}`);
  };

  // === INTERIOR DEKORASI STARTS HERE ===
  // Perubahan utama: root container jadi min-h-screen w-full (BUKAN fixed/h-full)
  return (
    <div className="min-h-screen w-full bg-black">
      {/* Dekorasi background: gradient & abstract circles */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-black to-[#1db954] opacity-95"></div>
        <svg className="absolute -top-40 -left-40 w-[600px] h-[600px] opacity-20" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="400" fill="#1db954" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-[480px] h-[480px] opacity-10" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="400" fill="#fff" />
        </svg>
        {/* "Floating notes" */}
        <span className="absolute left-20 top-10 text-5xl text-white/30 animate-bounce-slow">🎶</span>
        <span className="absolute right-36 bottom-12 text-6xl text-green-400/30 animate-bounce">🎹</span>
        <span className="absolute left-1/2 top-1/3 text-4xl text-white/40 animate-pulse">🎼</span>
      </div>
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-start pb-12">
        {/* LOGIN PAGE */}
        {!token ? (
          <div className="flex flex-col items-center justify-center w-full min-h-screen">
            <div className="mb-8 animate-fadein">
              <div className="flex items-center gap-3">
                <span className="text-7xl animate-bounce-slow drop-shadow-2xl">🎧</span>
                <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                  Welcome to Spotify Fantasy
                </span>
              </div>
              <p className="mt-4 text-center text-2xl text-gray-200 font-light italic tracking-wide drop-shadow">
                Temukan dunia musik tanpa batas, <br />
                satu klik menuju petualangan nada!
              </p>
              <div className="mt-4 flex gap-4 justify-center animate-bounce-slow">
                <span className="text-4xl text-white/90">🎼</span>
                <span className="text-4xl text-white/70">🎵</span>
                <span className="text-4xl text-white/80">🎶</span>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="px-10 py-5 bg-gradient-to-tr from-green-400 to-green-700 hover:from-green-700 hover:to-green-400 text-white font-bold text-2xl rounded-full shadow-2xl transition-all duration-200 ring-2 ring-white/30 hover:scale-105 focus:outline-none animate-pop flex items-center gap-3"
            >
              <svg viewBox="0 0 168 168" className="w-8 h-8">
                <circle fill="#1ED760" cx="84" cy="84" r="84" />
                <path
                  fill="#191414"
                  d="M120.7,122.6c-1.7,2.7-5.3,3.6-8,1.9c-21.8-13.3-49.3-16.3-81.9-8.6c-3.1,0.7-6.2-1.1-7-4.1
                    c-0.7-3.1,1.1-6.2,4.1-7c35.2-8.2,65.8-4.8,90.1,10.1C121.6,115.2,122.5,119.1,120.7,122.6z M131.6,105.1c-2.1,3.3-6.5,4.3-9.8,2.2
                    c-25-15.3-63.1-19.7-92.6-10.4c-3.7,1.1-7.7-1-8.8-4.7c-1.1-3.7,1-7.7,4.7-8.8c33.6-10.2,75.1-5.4,103.6,12.1
                    C132.7,98.2,133.7,101.8,131.6,105.1z M145.2,87.4c-2.6,4.1-8.1,5.3-12.1,2.7c-28.6-17.5-72.3-19.7-99-10.4
                    c-4.7,1.6-9.9-1.1-11.5-5.8c-1.6-4.7,1.1-9.9,5.8-11.5c31.1-10.3,80.4-8.1,113.5,12.1C146.5,78.3,147.8,83.3,145.2,87.4z"
                />
              </svg>
              Login with Spotify account
            </button>
            <div className="mt-12 text-center text-gray-200/60 text-lg tracking-wide drop-shadow">
              Powered by Spotify • Explore • Enjoy • Experience
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex justify-between items-center w-full max-w-6xl mt-8 mb-6 px-4 md:px-0">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide select-none">
                  <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">🎵 Esta Music App</span>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded shadow border border-green-100 backdrop-blur-md">
                    {user.images?.[0]?.url ? (
                      <img
                        src={user.images[0].url}
                        alt={user.display_name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-green-300"
                      />
                    ) : (
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 text-white font-bold border-2 border-green-300">
                        {user.display_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <span className="font-medium text-gray-800">{user.display_name}</span>
                  </div>
                )}

                <button onClick={handleLogout} className="text-red-500 underline font-semibold text-lg">Logout</button>
              </div>
            </div>
            {/* SEARCH */}
            <div className="w-full flex flex-col items-center">
              <input
                type="text"
                placeholder="Search track, album, or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-2xl p-4 bg-white/80 rounded-xl border border-green-200 shadow focus:ring-2 focus:ring-green-400 focus:outline-none text-lg mb-8 transition"
              />
              {/* SEARCH RESULTS */}
              {searchResults.length > 0 && (
                <div className="mb-10 w-full max-w-4xl">
                  <h2 className="text-2xl font-semibold mb-2 text-white drop-shadow">🔍 Search Results</h2>
                  <div className="space-y-4">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/90 p-4 rounded-xl shadow cursor-pointer hover:bg-green-50 flex flex-col transition duration-150"
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
                            className="w-16 h-16 rounded-lg shadow"
                          />
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
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
                        {item._type === "track" && (
                          <div className="mt-3">
                            <iframe
                              src={`https://open.spotify.com/embed/track/${item.id}`}
                              width="100%"
                              height="80"
                              frameBorder="0"
                              allow="encrypted-media"
                              title={item.name}
                              className="rounded-xl"
                            ></iframe>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ALBUMS / TRENDS */}
              {albums.length > 0 && (
                <div className="mb-10 w-full max-w-6xl">
                  <h2 className="text-2xl font-semibold mb-4 text-white drop-shadow">
                    {info ? "⭐ Album Random" : "⭐ Album from Your Top Tracks"}
                  </h2>
                  {info && <div className="mb-2 text-yellow-300 font-semibold">{info}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-7">
                    {albums.slice(0, 5).map((album) => (
                      <Link
                        key={album.id}
                        to={`/album/${album.id}`}
                        className="bg-white/90 rounded-2xl shadow-lg flex flex-col items-center p-4 hover:bg-green-50 transition"
                      >
                        <img
                          src={album.images[0]?.url}
                          alt={album.name}
                          className="w-36 h-36 object-cover rounded-xl mb-2 shadow"
                        />
                        <div className="font-bold text-center text-gray-900">{album.name}</div>
                        <div className="text-sm text-gray-500 text-center">
                          {album.artists?.map(a => a.name).join(", ")}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {/* Section Tren */}
                  {trendingAlbums.length > 0 && (
                    <>
                      <h2 className="text-2xl font-semibold mt-14 mb-4 text-white drop-shadow">
                        🔥 Albums Sedang Tren
                      </h2>
                      <div className="w-full overflow-x-auto hide-scrollbar">
                        <div className="flex gap-7 pb-4">
                          {trendingAlbums.map((album) => (
                            <Link
                              key={album.id}
                              to={`/album/${album.id}`}
                              className="bg-white/90 rounded-2xl shadow-lg flex flex-col items-center p-4 hover:bg-green-50 transition min-w-[220px] max-w-[220px] cursor-pointer"
                            >
                              <img
                                src={album.images?.[0]?.url}
                                alt={album.name}
                                className="w-32 h-32 object-cover rounded-xl mb-2 shadow"
                              />
                              <div className="font-bold text-center text-gray-900">{album.name}</div>
                              <div className="text-sm text-gray-500 text-center">{album.artists?.map(a => a.name).join(", ")}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      {/* Sembunyikan scrollbar pada flex scroll */}
                      <style>{`
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                      `}</style>
                    </>
                  )}
                </div>
              )}
              {error && (
                <div className="text-red-400 font-bold mb-4">{error}</div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Animasi CSS */}
      <style>{`
        .animate-fadein { animation: fadein 1.2s cubic-bezier(.57,1.27,.44,.98); }
        @keyframes fadein { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: none; } }
        .animate-pop { animation: pop .6s cubic-bezier(.25,1.7,.5,1.2); }
        @keyframes pop { 0% { transform: scale(0.9); } 60% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-bounce-slow { animation: bounce 2.4s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
      `}</style>
    </div>
  );
}

export default Home;