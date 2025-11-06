import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GroupsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { type } = useDevice();
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API}/chats?user_id=${user.id}`);
      const groupChats = response.data.filter(chat => chat.type === 'group');
      setGroups(groupChats);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const filteredGroups = groups.filter(group => {
    if (!searchQuery) return true;
    return group.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-[#111B21] relative">
      {/* Search Bar */}
      <div className="px-3 py-2 bg-[#111B21]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8696A0]" size={18} />
          <Input
            type="text"
            placeholder="Search groups"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#202C33] border-none text-white placeholder:text-[#8696A0] h-9 rounded-lg"
          />
        </div>
      </div>

      {/* Groups List */}
      <ScrollArea className="flex-1">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Users size={64} className="text-[#54656F] mb-4" />
            <p className="text-[#E9EDEF] text-lg font-medium mb-2">No groups yet</p>
            <p className="text-[#8696A0] text-sm">Create a group to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2A3942]">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 p-4 hover:bg-[#202C33] cursor-pointer transition-colors"
                onClick={() => navigate(`/chat/${group.id}`)}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback className="bg-[#54656F] text-white">
                    <Users size={24} />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-[#E9EDEF] text-[15px] font-medium truncate">
                    {group.name}
                  </p>
                  <p className="text-[#8696A0] text-sm truncate">
                    {group.participants?.length || 0} members
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Floating Action Button - Mobile only */}
      {type !== 'desktop' && (
        <button
          className="fixed bottom-20 right-6 w-14 h-14 bg-[#00A884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#06CF7A] transition-colors z-10"
          onClick={() => navigate('/groups/new')}
        >
          <Plus size={24} className="text-white" />
        </button>
      )}
    </div>
  );
};

export default GroupsScreen;
