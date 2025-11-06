import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, QrCode, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AndroidHeader = ({ title = 'WhatsApp' }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#008069] text-white shadow-md">
      {/* Top Bar */}
      <div className="h-[58px] px-5 flex items-center justify-between">
        <h1 className="text-[20px] font-semibold tracking-wide">{title}</h1>
        
        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-white/10 rounded-full transition-all active:bg-white/20 active:scale-95">
            <QrCode size={21} strokeWidth={2.5} />
          </button>
          <button className="p-2.5 hover:bg-white/10 rounded-full transition-all active:bg-white/20 active:scale-95">
            <Camera size={21} strokeWidth={2.5} />
          </button>
          <button className="p-2.5 hover:bg-white/10 rounded-full transition-all active:bg-white/20 active:scale-95">
            <Search size={21} strokeWidth={2.5} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2.5 hover:bg-white/10 rounded-full transition-all active:bg-white/20 active:scale-95">
                <MoreVertical size={21} strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white shadow-2xl rounded-md">
              <DropdownMenuItem onClick={() => navigate('/groups/new')} className="text-gray-900 cursor-pointer py-3 px-4 text-[15px]">
                New group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/broadcast')} className="text-gray-900 cursor-pointer py-3 px-4 text-[15px]">
                New broadcast
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/devices')} className="text-gray-900 cursor-pointer py-3 px-4 text-[15px]">
                Linked devices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/starred')} className="text-gray-900 cursor-pointer py-3 px-4 text-[15px]">
                Starred messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-gray-900 cursor-pointer py-3 px-4 text-[15px]">
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default AndroidHeader;
