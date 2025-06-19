const clientId = "a0d0b65251a04e6aa5230da17b2405b6"; // ganti dengan milikmu
const redirectUri = "https://esta-music.vercel.app";

const generateRandomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const generateCodeVerifier = () => generateRandomString(128);

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const createAuthUrl = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await sha256(codeVerifier);

  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read"
  ];

  const params = new URLSearchParams({
    response_type: "token",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};
