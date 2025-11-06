import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Users, Settings, PlusCircle } from 'lucide-react';

const IOSNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'status', label: 'Status', icon: PlusCircle, path: '/status' },
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    { id: 'groups', label: 'Groups', icon: Users, path: '/groups' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/chat');
    return location.pathname.startsWith(path);
  };

  return (
    <div className="wa-navbar fixed bottom-0 left-0 right-0 bg-[#1E2A30] border-t border-[#2A3942] pb-safe">
      <div className="flex justify-around items-center h-[60px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
            >
              <Icon 
                size={24} 
                className={active ? 'text-[#25D366]' : 'text-[#8696A0]'} 
              />
              <span 
                className={`text-xs mt-1 ${active ? 'text-[#25D366] font-medium' : 'text-[#8696A0]'}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IOSNavBar;
