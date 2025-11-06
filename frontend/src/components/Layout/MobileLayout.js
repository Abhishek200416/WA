import React from 'react';
import { Outlet } from 'react-router-dom';

const MobileLayout = ({ children, platform }) => {
  return (
    <div className={`wa-layout h-screen flex flex-col bg-white ${platform === 'ios' ? 'device-ios' : 'device-android'}`}>
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default MobileLayout;
