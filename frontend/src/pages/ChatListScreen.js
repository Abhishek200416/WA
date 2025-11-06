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
import { MessageCircle, Search, Plus, Settings, Phone, Video, Users, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { platform } = useDevice();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        // Update chat list
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
      setChats(response.data);
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

  const getChatDisplay = (chat) => {
    if (chat.type === 'direct') {
      const otherUserId = chat.participants.find(p => p !== user.id);
      const contact = contacts.find(c => c.user.id === otherUserId);
      return {
        name: contact?.user.display_name || 'Unknown',
        avatar: contact?.user.avatar_url,
        initials: contact?.user.display_name?.charAt(0) || '?'
      };
    }
    return {
      name: chat.name || 'Group',
      avatar: chat.avatar_url,
      initials: chat.name?.charAt(0) || 'G'
    };
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.last_message) return 'No messages yet';
    
    const msg = chat.last_message;
    let preview = '';
    
    if (msg.sender_id === user.id) {
      preview = 'You: ';
    }
    
    if (msg.message_type === 'text') {
      preview += msg.content;
    } else if (msg.message_type === 'image') {
      preview += '📷 Photo';
    } else if (msg.message_type === 'video') {
      preview += '🎥 Video';
    } else if (msg.message_type === 'audio') {
      preview += '🎵 Audio';
    } else if (msg.message_type === 'document') {
      preview += '📄 Document';
    }
    
    return preview.length > 50 ? preview.slice(0, 50) + '...' : preview;
  };

  const getLastMessageTime = (chat) => {
    if (!chat.last_message) return '';
    try {
      return formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: false });
    } catch {
      return '';
    }
  };

  const filteredChats = chats.filter(chat => {
    const display = getChatDisplay(chat);
    return display.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen flex flex-col bg-white" data-testid="chat-list-screen">
      {/* Header */}
      <div className={`${platform === 'ios' ? 'nav-bar' : platform === 'android' ? 'bg-green-600' : 'bg-white border-b'} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className={`text-xl font-bold ${platform === 'android' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            WA
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/status')}
            className={platform === 'android' ? 'text-white hover:bg-green-700' : ''}
            data-testid="status-button"
          >
            <Radio className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className={platform === 'android' ? 'text-white hover:bg-green-700' : ''}
            data-testid="settings-button"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-field"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No chats yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats.map((chat) => {
              const display = getChatDisplay(chat);
              return (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  data-testid={`chat-item-${chat.id}`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={display.avatar} />
                    <AvatarFallback className="bg-green-200 text-green-800">{display.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{display.name}</h3>
                      <span className="text-xs text-gray-500">{getLastMessageTime(chat)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{getLastMessagePreview(chat)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* New Chat FAB */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogTrigger asChild>
          <Button
            className={`${platform === 'android' ? 'fab' : 'fixed bottom-6 right-6 rounded-full w-14 h-14'} bg-green-500 hover:bg-green-600 shadow-lg`}
            data-testid="new-chat-button"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent data-testid="new-chat-dialog">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {contacts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No contacts yet</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.user.id}
                    onClick={() => createDirectChat(contact.user.id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    data-testid={`contact-item-${contact.user.id}`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.user.avatar_url} />
                      <AvatarFallback className="bg-blue-200 text-blue-800">
                        {contact.user.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contact.user.display_name}</p>
                      <p className="text-sm text-gray-500">{contact.user.about || 'Hey there! I am using WA'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatListScreen;
