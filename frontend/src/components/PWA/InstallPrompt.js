import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  // Don't show if already dismissed
  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed') === 'true') {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#00A884] text-white shadow-lg">
      <div className="flex items-center justify-between p-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <Download className="h-5 w-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Install WA</p>
            <p className="text-xs opacity-90">Add to your home screen for a better experience</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="bg-white text-[#00A884] hover:bg-gray-100 h-8 text-xs"
          >
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
