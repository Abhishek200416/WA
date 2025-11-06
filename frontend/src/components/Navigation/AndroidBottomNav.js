import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Clock } from 'lucide-react';

const AndroidBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    { id: 'status', label: 'Updates', icon: Clock, path: '/status' },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/chat/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-gray-200 safe-area-inset-bottom z-50 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
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
              <div className={`p-1.5 rounded-xl transition-all ${
                active ? 'bg-[#D9FDD3]' : ''
              }`}>
                <Icon
                  size={23}
                  className={active ? 'text-[#00A884]' : 'text-[#667781]'}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-wide ${
                  active ? 'text-[#00A884]' : 'text-[#667781]'
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
