import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Clock } from 'lucide-react';

const AndroidBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    { id: 'status', label: 'Status', icon: Clock, path: '/status' },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/chat/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#202C33] border-t border-[#2A3942] safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-[56px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
            >
              <Icon
                size={24}
                className={active ? 'text-[#00A884]' : 'text-[#8696A0]'}
              />
              <span
                className={`text-xs font-medium ${
                  active ? 'text-[#00A884]' : 'text-[#8696A0]'
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

export default AndroidBottomNav;
