import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDevice } from '../context/DeviceContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MessageCircle, Search, Plus, Settings, MoreVertical, Users, Edit, Archive, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChatListItem from '@/components/Chat/ChatListItem';
import ChatFilters from '@/components/Chat/ChatFilters';
import WALogo from '@/components/Branding/WALogo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { type, platform } = useDevice();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        fetchChats();
      });

      socket.on('user_online', (data) => {
        console.log('User online:', data);
      });

      socket.on('user_offline', (data) => {
        console.log('User offline:', data);
      });

      return () => {
        socket.off('new_message');
        socket.off('user_online');
        socket.off('user_offline');
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API}/chats?user_id=${user.id}`);
      const chatsData = response.data;
      
      const enrichedChats = await Promise.all(chatsData.map(async (chat) => {
        if (chat.type === 'direct') {
          const otherUserId = chat.participants.find(p => p !== user.id);
          if (otherUserId) {
            try {
              const userResponse = await axios.get(`${API}/users/me?user_id=${otherUserId}`);
              chat.otherUser = userResponse.data;
            } catch (error) {
              console.error('Failed to fetch other user:', error);
            }
          }
        }
        chat.current_user_id = user.id;
        return chat;
      }));
      
      setChats(enrichedChats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/contacts?user_id=${user.id}`);
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const createDirectChat = async (contactUserId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/chats?user_id=${user.id}`, {
        type: 'direct',
        participants: [user.id, contactUserId]
      });
      
      const newChat = response.data;
      toast.success('Chat created!');
      setShowNewChat(false);
      navigate(`/chat/${newChat.id}`);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Chat already exists');
      } else {
        toast.error('Failed to create chat');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    // Filter by search query
    if (searchQuery) {
      const name = chat.type === 'group' ? chat.name : (chat.otherUser?.name || chat.otherUser?.username || '');
      if (!name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by active filter
    if (activeFilter === 'unread' && !chat.unread_count) {
      return false;
    }
    if (activeFilter === 'favourites' && !chat.is_favourite) {
      return false;
    }
    if (activeFilter === 'groups' && chat.type !== 'group') {
      return false;
    }
    
    return true;
  });

  // Desktop Header
  const DesktopHeader = () => (
    <div className="h-[60px] bg-[#202C33] border-b border-[#2A3942] px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate('/settings')}>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-[#54656F] text-white">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
          <Users size={20} className="text-[#AEBAC1]" />
        </button>
        <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
          <MessageCircle size={20} className="text-[#AEBAC1]" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
              <MoreVertical size={20} className="text-[#AEBAC1]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/groups/new')}>
              New group
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/status')}>
              Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings size={16} className="mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500">
              <LogOut size={16} className="mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#111B21]">
      {/* Header */}
      {type === 'desktop' && <DesktopHeader />}

      {/* Search Bar */}
      <div className="px-3 py-2 bg-[#111B21]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8696A0]" size={18} />
          <Input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#202C33] border-none text-white placeholder:text-[#8696A0] h-9 rounded-lg"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <MessageCircle size={64} className="text-[#54656F] mb-4" />
            <h3 className="text-[#E9EDEF] text-lg font-medium mb-2">No chats yet</h3>
            <p className="text-[#8696A0] text-sm mb-4">Start a conversation with your contacts</p>
            <Button 
              onClick={() => setShowNewChat(true)}
              className="bg-[#25D366] hover:bg-[#1FAF54] text-white"
            >
              <Plus size={18} className="mr-2" />
              New Chat
            </Button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onClick={() => navigate(`/chat/${chat.id}`)}
            />
          ))
        )}
      </ScrollArea>

      {/* FAB (Android) */}
      {platform === 'android' && (
        <button
          onClick={() => setShowNewChat(true)}
          className="wa-fab fixed bottom-20 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#1FAF54] rounded-full flex items-center justify-center shadow-lg transition-all"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="bg-[#202C33] text-white border-[#2A3942]">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Search contacts"
              className="bg-[#2A3942] border-none text-white"
            />
            <ScrollArea className="h-64">
              {contacts.length === 0 ? (
                <p className="text-[#8696A0] text-center py-8">No contacts yet</p>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.user_id}
                    onClick={() => createDirectChat(contact.user_id)}
                    className="flex items-center gap-3 p-3 hover:bg-[#2A3942] cursor-pointer rounded-lg transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.user?.avatar} />
                      <AvatarFallback className="bg-[#54656F] text-white">
                        {contact.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#E9EDEF]">{contact.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-[#8696A0]">{contact.user?.about || 'Hey there!'}</p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatListScreen;
