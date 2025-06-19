const clientId = "a0d0b65251a04e6aa5230da17b2405b6"; // ganti dengan milikmu
const redirectUri = "https://esta-music.vercel.app"; // sesuai yang didaftarkan di Spotify Dashboard

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
    "user-top-read",
  ];

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes.join(" "),
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// ⬇️ Tambahkan bagian ini agar tidak error saat di-import
export const getTokenFromCode = async (code) => {
  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await response.json();
  return data.access_token;
};
