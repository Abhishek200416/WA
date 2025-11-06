import React, { createContext, useContext, useState, useEffect } from 'react';
import { isMobile, isTablet, isAndroid, isIOS, isBrowser } from 'react-device-detect';

const DeviceContext = createContext();

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
};

export const DeviceProvider = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    platform: 'web',
    className: 'device-desktop'
  });

  useEffect(() => {
    const detectDevice = () => {
      let type = 'desktop';
      let platform = 'web';
      let className = 'device-desktop';

      if (isMobile || isTablet) {
        if (isIOS) {
          type = 'mobile';
          platform = 'ios';
          className = 'device-ios';
        } else if (isAndroid) {
          type = 'mobile';
          platform = 'android';
          className = 'device-android';
        } else {
          type = 'mobile';
          platform = 'mobile';
          className = 'device-mobile';
        }
      } else if (isBrowser) {
        type = 'desktop';
        platform = 'web';
        className = 'device-desktop';
      }

      setDeviceInfo({ type, platform, className });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return (
    <DeviceContext.Provider value={deviceInfo}>
      <div className={deviceInfo.className}>{children}</div>
    </DeviceContext.Provider>
  );
};
