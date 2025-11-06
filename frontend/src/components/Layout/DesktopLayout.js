import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const DesktopLayout = ({ children }) => {
  const location = useLocation();
  const isChatOpen = location.pathname.startsWith('/chat/');

  return (
    <div className="wa-layout h-screen flex bg-[#E5DDD5]">
      {/* Sidebar - Always visible on desktop */}
      <div className="wa-sidebar w-[400px] flex-shrink-0 bg-white border-r border-[#E9EDEF] flex flex-col">
        {children}
      </div>

      {/* Main Chat Area */}
      <div className="wa-main flex-1 flex flex-col bg-[#E5DDD5]">
        {isChatOpen ? (
          <Outlet />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-[#F0F2F5]">
            <div className="text-center">
              <div className="mb-8">
                <svg viewBox="0 0 303 172" width="360" preserveAspectRatio="xMidYMid meet" fill="none" className="mx-auto">
                  <path d="M229.5 0C265.847 0 295 29.1532 295 65.5V66.5C295 102.847 265.847 132 229.5 132H73.5C37.1532 132 8 102.847 8 66.5V65.5C8 29.1532 37.1532 0 73.5 0H229.5Z" fill="#F0F2F5"/>
                  <circle cx="152" cy="86" r="16" fill="#00A884"/>
                </svg>
              </div>
              <h2 className="text-[32px] font-light text-[#41525D] mb-4">WhatsApp Web</h2>
              <p className="text-[14px] text-[#667781] max-w-md">
                Send and receive messages without keeping your phone online.
                <br />Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopLayout;
