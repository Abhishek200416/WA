import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Clock, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../../context/AuthContext';

const DesktopSidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const menuItems = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    { id: 'calls', label: 'Calls', icon: Phone, path: '/calls' },
    { id: 'status', label: 'Status', icon: Clock, path: '/status' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/chat/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-full flex flex-col bg-[#202C33]">
      {/* Header */}
      <div className="h-[60px] bg-[#202C33] border-b border-[#2A3942] px-4 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-[#2A3942] rounded-full transition-colors"
        >
          {expanded ? <X size={20} className="text-[#AEBAC1]" /> : <Menu size={20} className="text-[#AEBAC1]" />}
        </button>
        
        {expanded && (
          <span className="text-[#E9EDEF] text-lg font-semibold">WhatsApp</span>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                active ? 'bg-[#2A3942]' : 'hover:bg-[#2A3942]'
              }`}
            >
              <Icon
                size={24}
                className={active ? 'text-[#00A884]' : 'text-[#AEBAC1]'}
              />
              {expanded && (
                <span
                  className={`text-sm font-medium ${
                    active ? 'text-[#E9EDEF]' : 'text-[#AEBAC1]'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Settings at Bottom */}
      <div className="border-t border-[#2A3942]">
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
            location.pathname === '/settings' ? 'bg-[#2A3942]' : 'hover:bg-[#2A3942]'
          }`}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-[#54656F] text-white">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="flex-1 text-left">
              <p className="text-[#E9EDEF] text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-[#8696A0] text-xs">@{user?.username || 'username'}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default DesktopSidebar;
