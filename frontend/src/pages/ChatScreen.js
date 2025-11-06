import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDevice } from '../context/DeviceContext';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  ArrowLeft, Video, Phone, MoreVertical, Smile, Paperclip, 
  Mic, Send, Search, Image as ImageIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MessageBubble from '@/components/Chat/MessageBubble';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatScreen = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { type, platform } = useDevice();
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId && user) {
      fetchChat();
      fetchMessages();
    }
  }, [chatId, user]);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join_chat', { chat_id: chatId, user_id: user.id });

      socket.on('new_message', (message) => {
        if (message.chat_id === chatId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      socket.on('typing_start', (data) => {
        if (data.chat_id === chatId && data.user_id !== user.id) {
          setOtherUserTyping(true);
        }
      });

      socket.on('typing_stop', (data) => {
        if (data.chat_id === chatId && data.user_id !== user.id) {
          setOtherUserTyping(false);
        }
      });

      socket.on('message_edited', (data) => {
        setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, ...data.updates } : m));
      });

      socket.on('message_deleted', (data) => {
        setMessages(prev => prev.filter(m => m.id !== data.message_id));
      });

      return () => {
        socket.off('new_message');
        socket.off('typing_start');
        socket.off('typing_stop');
        socket.off('message_edited');
        socket.off('message_deleted');
      };
    }
  }, [socket, chatId, user]);

  const fetchChat = async () => {
    try {
      const response = await axios.get(`${API}/chats/${chatId}?user_id=${user.id}`);
      const chatData = response.data;
      
      if (chatData.type === 'direct') {
        const otherUserId = chatData.participants.find(p => p !== user.id);
        if (otherUserId) {
          const userResponse = await axios.get(`${API}/users/me?user_id=${otherUserId}`);
          chatData.otherUser = userResponse.data;
        }
      }
      
      setChat(chatData);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages?chat_id=${chatId}&user_id=${user.id}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = (text) => {
    setMessageText(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket?.emit('typing_start', { chat_id: chatId, user_id: user.id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing_stop', { chat_id: chatId, user_id: user.id });
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !editingMessage) return;

    if (editingMessage) {
      try {
        await axios.put(
          `${API}/messages/${editingMessage.id}?user_id=${user.id}`,
          { text: messageText }
        );
        toast.success('Message edited');
        setEditingMessage(null);
        setMessageText('');
      } catch (error) {
        toast.error('Failed to edit message');
      }
      return;
    }

    try {
      const messageData = {
        chat_id: chatId,
        text: messageText,
        reply_to: replyTo?.id || null
      };

      const response = await axios.post(
        `${API}/messages?user_id=${user.id}`,
        messageData
      );

      setMessageText('');
      setReplyTo(null);
      setIsTyping(false);
      socket?.emit('typing_stop', { chat_id: chatId, user_id: user.id });
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await axios.post(
        `${API}/upload?user_id=${user.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const fileUrl = uploadResponse.data.url;
      
      await axios.post(
        `${API}/messages?user_id=${user.id}`,
        {
          chat_id: chatId,
          text: '',
          attachments: [{
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
            url: fileUrl,
            name: file.name,
            size: file.size
          }]
        }
      );

      toast.success('File sent');
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleDeleteMessage = async (message) => {
    try {
      await axios.delete(`${API}/messages/${message.id}?user_id=${user.id}&delete_for=everyone`);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleReactToMessage = async (message) => {
    try {
      await axios.post(`${API}/messages/${message.id}/react?user_id=${user.id}`, {
        emoji: '👍'
      });
      toast.success('Reaction added');
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const getChatName = () => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.name;
    return chat.otherUser?.name || chat.otherUser?.username || 'Unknown';
  };

  const getChatAvatar = () => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.avatar;
    return chat.otherUser?.avatar;
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0B141A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25D366] mx-auto mb-4"></div>
          <p className="text-[#8696A0]">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0B141A]">
      {/* Chat Header */}
      <div className="h-[60px] bg-[#202C33] border-b border-[#2A3942] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {type !== 'desktop' && (
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#2A3942] rounded-full">
              <ArrowLeft size={20} className="text-[#AEBAC1]" />
            </button>
          )}
          
          <Avatar className="w-10 h-10">
            <AvatarImage src={getChatAvatar()} />
            <AvatarFallback className="bg-[#54656F] text-white">
              {getChatName().charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-[#E9EDEF]">{getChatName()}</h3>
            {otherUserTyping ? (
              <p className="text-xs text-[#25D366]">typing...</p>
            ) : (
              <p className="text-xs text-[#8696A0]">online</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
            <Video size={20} className="text-[#AEBAC1]" />
          </button>
          <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
            <Phone size={20} className="text-[#AEBAC1]" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
                <MoreVertical size={20} className="text-[#AEBAC1]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Search size={16} className="mr-2" /> Search
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/chat/${chatId}/info`)}>
                Contact info
              </DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem>Clear chat</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                Delete chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 wa-chat-background overflow-y-auto px-4 py-2">
        <ScrollArea className="h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#8696A0]">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user.id}
                onReply={setReplyTo}
                onEdit={(msg) => {
                  setEditingMessage(msg);
                  setMessageText(msg.text);
                }}
                onDelete={handleDeleteMessage}
                onReact={handleReactToMessage}
                senderName={message.sender_name}
                senderAvatar={message.sender_avatar}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="bg-[#202C33] border-t border-l-4 border-[#25D366] px-4 py-2 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#25D366] font-semibold">
              {replyTo.sender_id === user.id ? 'You' : replyTo.sender_name}
            </p>
            <p className="text-sm text-[#8696A0] truncate">{replyTo.text}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-[#8696A0] hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div className="bg-[#202C33] border-t border-l-4 border-blue-500 px-4 py-2 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-blue-500 font-semibold">Edit message</p>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null);
              setMessageText('');
            }} 
            className="text-[#8696A0] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-[#202C33] px-4 py-2 flex items-center gap-2">
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
              <Smile size={24} className="text-[#8696A0]" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-auto p-0 border-none">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
          </PopoverContent>
        </Popover>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-[#2A3942] rounded-full transition-colors"
        >
          <Paperclip size={24} className="text-[#8696A0]" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,application/*"
        />

        <Input
          type="text"
          placeholder="Type a message"
          value={messageText}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-[#2A3942] border-none text-white placeholder:text-[#8696A0] h-10 rounded-lg"
        />

        {messageText.trim() ? (
          <button 
            onClick={handleSendMessage}
            className="p-2 bg-[#25D366] hover:bg-[#1FAF54] rounded-full transition-colors"
          >
            <Send size={20} className="text-white" />
          </button>
        ) : (
          <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
            <Mic size={24} className="text-[#8696A0]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
