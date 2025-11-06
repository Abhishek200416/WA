import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Camera } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AndroidTopBar = ({ title = 'WhatsApp' }) => {
  const navigate = useNavigate();

  return (
    <div className="wa-header bg-[#008069] text-white h-[56px] px-4 flex items-center justify-between shadow-md">
      <h1 className="text-[20px] font-medium">{title}</h1>
      
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Camera className="w-5 h-5" />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={() => navigate('/search')}
        >
          <Search className="w-5 h-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>New group</DropdownMenuItem>
            <DropdownMenuItem>New broadcast</DropdownMenuItem>
            <DropdownMenuItem>Linked devices</DropdownMenuItem>
            <DropdownMenuItem>Starred messages</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AndroidTopBar;
