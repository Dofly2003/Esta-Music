const clientId = "a0d0b65251a04e6aa5230da17b2405b6"; // ganti dengan milikmu
// src/auth.js
export const redirect_uri = "http://localhost:3000"; // Ganti sesuai deploy
export const scope = "user-top-read streaming"; // Penting: streaming wajib untuk playback

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

export async function createAuthUrl() {
  const codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(64)))
    .map((x) => ("0" + x.toString(16)).slice(-2))
    .join("");
  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getTokenFromCode(code) {
  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri,
    code_verifier: codeVerifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem("spotify_token", data.access_token);
    return data.access_token;
  }
  return null;
}