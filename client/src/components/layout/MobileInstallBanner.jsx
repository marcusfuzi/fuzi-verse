import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';
import FuziLogoOfficial from '../ui/FuziLogoOfficial.jsx';

export default function MobileInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // Check if already launched as installed standalone PWA app
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      localStorage.getItem('fuzi_app_installed') === 'true';
    if (isApp) {
      setIsStandalone(true);
      return;
    }

    // Capture beforeinstallprompt for Android Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('fuzi_dismiss_install')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      localStorage.setItem('fuzi_app_installed', 'true');
      setIsStandalone(true);
      setShowBanner(false);
      window.dispatchEvent(new Event('fuzi-app-installed'));
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // If mobile device and not dismissed, show banner after short delay
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && !sessionStorage.getItem('fuzi_dismiss_install')) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('fuzi_app_installed', 'true');
        window.dispatchEvent(new Event('fuzi-app-installed'));
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show simple manual guide for iOS or browsers without native prompt
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('fuzi_dismiss_install', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      <div className="fixed top-2 left-2 right-2 z-50 animate-slide-down md:hidden select-none">
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <FuziLogoOfficial size="sm" variant="round" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">Install FUZI VERSE</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  App
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                Full-screen player • No browser bar • Instant load
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Installation Guide Modal if browser doesn't trigger prompt */}
      {showManualGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Install on Phone</span>
              </h3>
              <button
                onClick={() => setShowManualGuide(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Apne phone par FUZI VERSE app install karne ke liye:
            </p>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Chrome browser mein top-right <strong>3 dots (⋮)</strong> ya browser menu par tap karein.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Menu mein <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> chunein.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-white/5 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <span><strong>Add</strong> ya <strong>Install</strong> par tap karein. App aapke phone mein bina parsing error ke install ho jayegi!</span>
              </div>
            </div>

            <button
              onClick={() => setShowManualGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors"
            >
              Samajh Gaya (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
