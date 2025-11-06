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
    <div className="wa-header bg-[#1F2C34] text-white">
      {/* Top Bar */}
      <div className="h-[60px] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="text-xl font-semibold">{title || 'WA'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
            <Camera size={22} />
          </button>
          <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
            <Search size={22} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
                <MoreVertical size={22} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/groups')}>New group</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/broadcast')}>New broadcast</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/devices')}>Linked devices</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/starred')}>Starred messages</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      {!title && (
        <div className="px-4 pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-transparent h-auto p-0 space-x-6">
              <TabsTrigger 
                value="chats" 
                onClick={() => navigate('/')}
                className="bg-transparent text-[#8696A0] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#25D366] rounded-none pb-2"
              >
                CHATS
              </TabsTrigger>
              <TabsTrigger 
                value="status" 
                onClick={() => navigate('/status')}
                className="bg-transparent text-[#8696A0] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#25D366] rounded-none pb-2"
              >
                STATUS
              </TabsTrigger>
              <TabsTrigger 
                value="calls" 
                onClick={() => navigate('/calls')}
                className="bg-transparent text-[#8696A0] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#25D366] rounded-none pb-2"
              >
                CALLS
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default AndroidTopBar;
