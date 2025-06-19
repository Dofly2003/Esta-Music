const clientId = "a0d0b65251a04e6aa5230da17b2405b6"; // ganti dengan milikmu
const redirectUri = "https://esta-music.vercel.app/";
const scopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
];

export const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
  redirectUri
)}&scope=${encodeURIComponent(scopes.join(" "))}`;
