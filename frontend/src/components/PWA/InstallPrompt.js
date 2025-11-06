import React, { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsInStandaloneMode(standalone);

    // Check if dismissed
    const dismissed = localStorage.getItem('pwa-dismissed') === 'true';
    
    if (!standalone && !dismissed) {
      if (iOS) {
        // For iOS, show custom prompt if not in standalone mode
        setShowPrompt(true);
      } else {
        // For other platforms, use standard beforeinstallprompt
        const handler = (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // For iOS, we can't programmatically trigger install, just show instructions
      alert('To install this app on your iOS device:\n\n1. Tap the Share button (bottom of Safari)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right corner');
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (!showPrompt || isInStandaloneMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#00A884] text-white shadow-lg">
      <div className="flex items-center justify-between p-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {isIOS ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          <div className="flex-1">
            <p className="text-sm font-medium">Install WA</p>
            <p className="text-xs opacity-90">
              {isIOS 
                ? 'Tap Share → Add to Home Screen' 
                : 'Add to your home screen for a better experience'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && (
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-white text-[#00A884] hover:bg-gray-100 h-8 text-xs font-medium"
            >
              Install
            </Button>
          )}
          {isIOS && (
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-white text-[#00A884] hover:bg-gray-100 h-8 text-xs font-medium"
            >
              How to Install
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
