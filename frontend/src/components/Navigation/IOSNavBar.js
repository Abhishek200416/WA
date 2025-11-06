import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Users, Settings } from 'lucide-react';

const IOSNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/status', icon: Users, label: 'Status' },
    { path: '/', icon: MessageCircle, label: 'Chats' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="wa-navbar fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-[50px] pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[#007AFF]' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IOSNavBar;
