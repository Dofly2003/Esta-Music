import React from "react";

function Player() {
  const defaultUri = "spotify:track:7ouMYWpwJ422jRcDASZB7P"; // ubah ke track yang kamu suka

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🎵 Spotify Player (Iframe)</h2>
      <iframe
        src={`https://open.spotify.com/embed/track/7ouMYWpwJ422jRcDASZB7P`}
        width="100%"
        height="80"
        frameBorder="0"
        allowtransparency="true"
        allow="encrypted-media"
        title="Spotify Player"
      ></iframe>
    </div>
  );
}

export default Player;
