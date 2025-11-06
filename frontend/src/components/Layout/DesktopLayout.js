import React from 'react';
import { Outlet } from 'react-router-dom';

const DesktopLayout = ({ children }) => {
  return (
    <div className="wa-layout flex h-screen bg-[#111B21]">
      {/* Left Sidebar */}
      <div className="wa-sidebar w-[400px] border-r border-[#2A3942] bg-[#111B21] flex flex-col">
        {children}
      </div>
      
      {/* Main Chat Area */}
      <div className="wa-main flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default DesktopLayout;
