import React from 'react';

const MobileLayout = ({ children, platform }) => {
  return (
    <div className={`wa-layout h-screen flex flex-col bg-[#111B21] ${platform === 'ios' ? 'device-ios' : platform === 'android' ? 'device-android' : ''}`}>
      {children}
    </div>
  );
};

export default MobileLayout;
