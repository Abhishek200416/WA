import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GroupsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chats?user_id=${user.id}&type=group`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0B141A]">
      {/* Header */}
      <div className="bg-[#1F2C34] p-4 border-b border-[#2A3942]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-xl font-semibold">Groups</h1>
          <Button
            size="sm"
            className="bg-[#25D366] hover:bg-[#20BD5F] text-white"
            onClick={() => navigate('/create-group')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8696A0]" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1F2C34] border-[#2A3942] text-white placeholder:text-[#8696A0]"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25D366]"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Users className="h-20 w-20 text-[#8696A0] mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Groups Yet</h3>
            <p className="text-[#8696A0] text-sm mb-4">
              Create a group to start chatting with multiple people at once
            </p>
            <Button
              className="bg-[#25D366] hover:bg-[#20BD5F] text-white"
              onClick={() => navigate('/create-group')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </div>
        ) : (
          <div>
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/chat/${group.id}`)}
                className="flex items-center gap-3 p-4 hover:bg-[#1F2C34] cursor-pointer border-b border-[#2A3942]"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback className="bg-[#25D366] text-white">
                    <Users className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium truncate">{group.name}</h3>
                    <span className="text-xs text-[#8696A0]">
                      {group.last_message_time && new Date(group.last_message_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#8696A0] truncate">
                    {group.last_message || `${group.participants?.length || 0} participants`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsScreen;
