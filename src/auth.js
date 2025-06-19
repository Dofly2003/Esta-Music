const clientId = "a0d0b65251a04e6aa5230da17b2405b6"; // ganti dengan milikmu
const redirectUri = "https://esta-music.vercel.app";

const generateRandomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
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
  const verifier = generateCodeVerifier();
  const challenge = await sha256(verifier);

  localStorage.setItem("spotify_code_verifier", verifier);

  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
  ];

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes.join(" "),
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getTokenFromCode = async (code) => {
  const verifier = localStorage.getItem("spotify_code_verifier");

  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();
  console.log("Token Response:", data);

  if (data.access_token) {
    localStorage.setItem("spotify_token", data.access_token);
    window.history.replaceState(null, "", "/"); // Hapus ?code dari URL
    window.location.reload(); // Refresh
  }
};
