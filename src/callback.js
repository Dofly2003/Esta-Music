import { useEffect } from "react";

const Callback = () => {
  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace("#", "?")).get("access_token");
    if (token) {
      localStorage.setItem("spotify_token", token);
      window.location.href = "/";
    }
  }, []);

  return <div className="text-center mt-20 text-xl">Logging in...</div>;
};

export default Callback;
