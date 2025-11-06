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
    <div className="bg-[#008069] text-white">
      {/* Top Bar */}
      <div className="h-[56px] px-4 flex items-center justify-between">
        <h1 className="text-[19px] font-medium tracking-wide">{title}</h1>
        
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <QrCode size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Camera size={20} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuItem onClick={() => navigate('/groups/new')} className="text-gray-900 cursor-pointer">
                New group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/devices')} className="text-gray-900 cursor-pointer">
                Linked devices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-gray-900 cursor-pointer">
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
