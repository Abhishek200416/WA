import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Camera, Menu } from 'lucide-react';
import WALogo from '../Branding/WALogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AndroidTopBar = ({ title }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="wa-header bg-[#008069] text-white shadow-md">
      {/* Top Bar with WhatsApp Android styling */}
      <div className="h-[56px] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[19px] font-medium tracking-wide">{title || 'WhatsApp'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Camera size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuItem onClick={() => navigate('/groups')} className="text-gray-900 cursor-pointer">
                New group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/broadcast')} className="text-gray-900 cursor-pointer">
                New broadcast
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/devices')} className="text-gray-900 cursor-pointer">
                Linked devices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/starred')} className="text-gray-900 cursor-pointer">
                Starred messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-gray-900 cursor-pointer">
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs - WhatsApp Android style */}
      {!title && (
        <div className="bg-[#008069] border-b-[1px] border-white/20">
          <div className="flex items-center px-4">
            <button
              onClick={() => { setActiveTab('chats'); navigate('/'); }}
              className={`flex-1 text-center py-3 text-sm font-medium tracking-wider transition-all relative ${
                activeTab === 'chats' 
                  ? 'text-white' 
                  : 'text-white/70'
              }`}
            >
              CHATS
              {activeTab === 'chats' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-sm"></div>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('status'); navigate('/status'); }}
              className={`flex-1 text-center py-3 text-sm font-medium tracking-wider transition-all relative ${
                activeTab === 'status' 
                  ? 'text-white' 
                  : 'text-white/70'
              }`}
            >
              STATUS
              {activeTab === 'status' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-sm"></div>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('calls'); navigate('/calls'); }}
              className={`flex-1 text-center py-3 text-sm font-medium tracking-wider transition-all relative ${
                activeTab === 'calls' 
                  ? 'text-white' 
                  : 'text-white/70'
              }`}
            >
              CALLS
              {activeTab === 'calls' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-sm"></div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AndroidTopBar;
