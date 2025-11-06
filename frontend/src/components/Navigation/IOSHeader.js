import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Camera, QrCode, MoreVertical, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const IOSHeader = ({ title = 'Chats' }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F6F6F6] border-b border-gray-200">
      {/* Top Bar */}
      <div className="h-[56px] px-4 flex items-center justify-between">
        <h1 className="text-[34px] font-bold text-black tracking-tight leading-none">{title}</h1>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-black/5 rounded-full transition-all active:scale-95">
            <QrCode size={22} className="text-[#007AFF]" strokeWidth={2} />
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-all active:scale-95">
            <Camera size={22} className="text-[#007AFF]" strokeWidth={2} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-black/5 rounded-full transition-all active:scale-95">
                <MoreVertical size={22} className="text-[#007AFF]" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white shadow-xl border-gray-200">
              <DropdownMenuItem onClick={() => navigate('/groups/new')} className="text-gray-900 cursor-pointer py-3">
                New Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/broadcast')} className="text-gray-900 cursor-pointer py-3">
                New Broadcast
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/devices')} className="text-gray-900 cursor-pointer py-3">
                Linked Devices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/starred')} className="text-gray-900 cursor-pointer py-3">
                Starred Messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-gray-900 cursor-pointer py-3">
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default IOSHeader;
