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
import { MessageCircle, Search, Plus, Settings, MoreVertical, Users, Edit, Archive } from 'lucide-react';
import ChatListItem from '@/components/Chat/ChatListItem';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuth();
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
      
      // Enrich chats with other user data for direct chats
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
        participants: [contactUserId]
      });
      setShowNewChat(false);
      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to create chat');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = () => {
    // TODO: Implement group creation
    toast.info('Group creation coming soon!');
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const name = chat.type === 'direct'
      ? chat.otherUser?.display_name || ''
      : chat.name || '';
    
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Desktop only, mobile uses platform nav */}
      {type === 'desktop' && (
        <div className="wa-header bg-[#F0F2F5] border-b border-gray-200 h-[60px] px-4 flex items-center justify-between">
          <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate('/settings')}>
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-[#DFE5E7] text-gray-600">
              {user?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            <button 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              onClick={() => {/* TODO: Communities */}}
            >
              <Users className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              onClick={() => navigate('/status')}
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
              <DialogTrigger asChild>
                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <Edit className="w-5 h-5 text-gray-600" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Chat</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px]">
                  {contacts.map((contact) => (
                    <div
                      key={contact.contact.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => createDirectChat(contact.user.id)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.user.avatar_url} />
                        <AvatarFallback className="bg-[#DFE5E7]">
                          {contact.user.display_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.user.display_name}</p>
                        <p className="text-sm text-gray-500">{contact.user.about || 'Hey there! I am using WhatsApp.'}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <Button onClick={createGroup} variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  New Group
                </Button>
              </DialogContent>
            </Dialog>
            <button 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              onClick={() => navigate('/settings')}
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="px-3 py-2 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#F0F2F5] border-0 rounded-lg h-9"
          />
        </div>
      </div>

      {/* Filter Tabs (Optional) */}
      <div className="flex gap-2 px-3 py-2 border-b border-gray-100 overflow-x-auto">
        <button className="px-4 py-1.5 rounded-full bg-[#E7F8EE] text-[#027A48] text-sm font-medium whitespace-nowrap">
          All
        </button>
        <button className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium whitespace-nowrap hover:bg-gray-200">
          Unread
        </button>
        <button className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium whitespace-nowrap hover:bg-gray-200">
          Groups
        </button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No chats yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Start a conversation by clicking the new chat button
            </p>
            <Button onClick={() => setShowNewChat(true)} className="bg-[#00A884] hover:bg-[#017561]">
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        ) : (
          <div>
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                user={user}
                onClick={() => navigate(`/chat/${chat.id}`)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* FAB for Android */}
      {platform === 'android' && (
        <button
          onClick={() => setShowNewChat(true)}
          className="wa-fab fixed bottom-20 right-4 w-14 h-14 bg-[#00A884] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#017561] transition-colors z-40"
        >
          <Edit className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatListScreen;
