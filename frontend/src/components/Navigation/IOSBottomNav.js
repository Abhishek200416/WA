import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Clock, Settings as SettingsIcon } from 'lucide-react';

const IOSBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'status', label: 'Updates', icon: Clock, path: '/status' },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/chat/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-[#F9F9F9]/95 border-t border-gray-200 safe-area-inset-bottom z-50" 
      style={{ 
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)'
      }}
    >
      <div className="flex items-center justify-around h-[58px] px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all active:scale-95"
            >
              <Icon
                size={24}
                className={active ? 'text-[#007AFF]' : 'text-[#8E8E93]'}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium tracking-tight ${
                  active ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
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

export default IOSBottomNav;
