import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Clock, Settings as SettingsIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '../../context/AuthContext';

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
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

  const NavButton = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate(item.path)}
              className={`w-full h-[72px] flex items-center justify-center transition-colors relative ${
                active ? 'bg-[#2A3942]' : 'hover:bg-[#2A3942]'
              }`}
            >
              <Icon
                size={24}
                className={active ? 'text-[#00A884]' : 'text-[#AEBAC1]'}
              />
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#00A884] rounded-r-full"></div>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#111B21] border-[#2A3942] text-white">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#202C33]">
      {/* Navigation Menu */}
      <div className="flex-1">
        {menuItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>

      {/* Settings at Bottom */}
      <div className="border-t border-[#2A3942]">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/settings')}
                className={`w-full h-[72px] flex items-center justify-center transition-colors relative ${
                  location.pathname === '/settings' ? 'bg-[#2A3942]' : 'hover:bg-[#2A3942]'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-[#54656F] text-white text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {location.pathname === '/settings' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#00A884] rounded-r-full"></div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#111B21] border-[#2A3942] text-white">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DesktopSidebar;
