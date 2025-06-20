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
      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow font-bold ml-2 transition"
      title="Install App"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-1" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7 7 7-7"/></svg>
      Install App
    </button>
  );
}