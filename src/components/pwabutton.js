import React, { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShown(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShown(false);
    }
  };

  if (!shown) return null;
  return (
    <button
      onClick={handleInstall}
      className="ml-2 px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow font-bold flex items-center transition"
      title="Install App"
    >
      {/* Mobile: Only icon */}
      <span className="block sm:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} fill="none" viewBox="0 0 24 24">
          <path d="M12 19V5M5 12l7 7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {/* Desktop: Icon + text */}
      <span className="hidden sm:flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width={20} height={20} fill="none" viewBox="0 0 24 24">
          <path d="M12 19V5M5 12l7 7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Install App
      </span>
    </button>
  );
}