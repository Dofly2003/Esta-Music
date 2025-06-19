import React, { useEffect, useState } from "react";
import { createAuthUrl, getTokenFromCode } from "../auth";
import axios from "axios";
import { Link } from "react-router-dom";

const randomArtists = [
  "Drake", "Taylor Swift", "Coldplay", "Adele", "Eminem", "BTS", "Ed Sheeran"
];

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
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");

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

    const fetchData = async () => {
      try {
        const artistSample = randomArtists.sort(() => 0.5 - Math.random()).slice(0, 3);
        const playlistResult = [];
        const albumResult = [];

        for (const name of artistSample) {
          const playlistRes = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=playlist&limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (playlistRes.data.playlists.items[0]) {
            playlistResult.push(playlistRes.data.playlists.items[0]);
          }

          const artistRes = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const artist = artistRes.data.artists.items[0];
          if (artist) {
            const albumsRes = await axios.get(`https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=1`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            albumResult.push(...albumsRes.data.items);
          }
        }

        setPlaylists(playlistResult);
        setAlbums(albumResult);
      } catch (err) {
        console.error("Fetch random playlist/album error:", err);
        setError("Gagal mengambil data playlist/album");
      }
    };

    fetchData();
  }, [token]);

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
        setSearchResults(shuffleArray(res.data.tracks.items));
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
              <h2 className="text-xl font-bold mb-4">🔥 Random Artist Albums</h2>
              <div className="grid grid-cols-2 gap-4">
                {albums.map((album) => (
                  <a
                    key={album.id}
                    href={`https://open.spotify.com/album/${album.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded shadow p-3 hover:bg-gray-50"
                  >
                    <img src={album.images[0]?.url} alt={album.name} className="w-full rounded mb-2" />
                    <div className="font-bold">{album.name}</div>
                    <div className="text-sm text-gray-500">{album.artists.map(a => a.name).join(", ")}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {playlists.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">🎧 Random Artist Playlists</h2>
              <div className="grid grid-cols-2 gap-4">
                {playlists.map((playlist) => (
                  <a
                    key={playlist.id}
                    href={`https://open.spotify.com/playlist/${playlist.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded shadow p-3 hover:bg-gray-50"
                  >
                    <img src={playlist.images[0]?.url} alt={playlist.name} className="w-full rounded mb-2" />
                    <div className="font-bold">{playlist.name}</div>
                    <div className="text-sm text-gray-500">by {playlist.owner.display_name}</div>
                  </a>
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
