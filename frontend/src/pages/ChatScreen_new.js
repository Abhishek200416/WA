import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDevice } from '../context/DeviceContext';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import ChatHeader from '@/components/Chat/ChatHeader';
import MessageBubble from '@/components/Chat/MessageBubble';
import MessageInput from '@/components/Chat/MessageInput';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatScreen = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { type } = useDevice();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (chatId && user) {
      fetchChat();
      fetchMessages();
    }
  }, [chatId, user]);

  useEffect(() => {
    if (socket && chatId) {
      socket.on('new_message', (message) => {
        if (message.chat_id === chatId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          
          // Send delivered receipt
          if (message.sender_id !== user.id) {
            socket.emit('message_delivered', {
              message_id: message.id,
              user_id: user.id
            });
            
            // Send read receipt
            socket.emit('message_read', {
              message_id: message.id,
              user_id: user.id
            });
          }
        }
      });

      socket.on('typing', (data) => {
        if (data.chat_id === chatId && data.user_id !== user.id) {
          setTyping(data.typing);
          if (data.typing) {
            setTimeout(() => setTyping(false), 3000);
          }
        }
      });

      socket.on('message_status', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.message_id ? { ...msg, status: data.status } : msg
        ));
      });

      socket.on('message_updated', (updatedMessage) => {
        if (updatedMessage.chat_id === chatId) {
          setMessages(prev => prev.map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      });

      socket.on('message_reaction', (updatedMessage) => {
        if (updatedMessage.chat_id === chatId) {
          setMessages(prev => prev.map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('typing');
        socket.off('message_status');
        socket.off('message_updated');
        socket.off('message_reaction');
      };
    }
  }, [socket, chatId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      const response = await axios.get(`${API}/chats?user_id=${user.id}`);
      const foundChat = response.data.find(c => c.id === chatId);
      
      if (foundChat) {
        // Enrich with other user data for direct chats
        if (foundChat.type === 'direct') {
          const otherUserId = foundChat.participants.find(p => p !== user.id);
          if (otherUserId) {
            try {
              const userResponse = await axios.get(`${API}/users/me?user_id=${otherUserId}`);
              foundChat.otherUser = userResponse.data;
            } catch (error) {
              console.error('Failed to fetch other user:', error);
            }
          }
        }
        setChat(foundChat);
      } else {
        toast.error('Chat not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/chats/${chatId}/messages?user_id=${user.id}&limit=100`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    try {
      const response = await axios.post(`${API}/messages?user_id=${user.id}`, {
        chat_id: chatId,
        content: content.trim(),
        message_type: 'text'
      });

      // Message will be added via socket event
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }

    // Stop typing indicator
    if (socket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('typing_stop', { chat_id: chatId, user_id: user.id });
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    // Send typing start
    socket.emit('typing_start', { chat_id: chatId, user_id: user.id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { chat_id: chatId, user_id: user.id });
    }, 3000);
  };

  const handleAttachment = () => {
    setShowAttachmentMenu(true);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(`${API}/upload?user_id=${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileData = uploadResponse.data;
      const messageType = file.type.startsWith('image/') ? 'image' :
                         file.type.startsWith('video/') ? 'video' :
                         file.type.startsWith('audio/') ? 'audio' : 'document';

      await axios.post(`${API}/messages?user_id=${user.id}`, {
        chat_id: chatId,
        content: '',
        message_type: messageType,
        attachments: [{
          url: fileData.file_url,
          thumbnail_url: fileData.thumbnail_url,
          filename: file.name,
          content_type: file.type,
          size: file.size
        }]
      });

      toast.success('File sent successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to send file');
    } finally {
      setUploading(false);
      setShowAttachmentMenu(false);
    }
  };

  const handleVoiceRecord = () => {
    toast.info('Voice recording coming soon!');
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-[#E5DDD5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A884]"></div>
      </div>
    );
  }

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <ChatHeader chat={chat} typing={typing} online={false} />

      {/* Messages Area with WhatsApp Background */}
      <div className="flex-1 wa-chat-background overflow-hidden">
        <ScrollArea className="h-full px-4 py-2" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto">
            {/* Date grouped messages */}
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex justify-center my-4">
                  <div className="bg-white/90 shadow-sm rounded-lg px-3 py-1.5 text-xs text-gray-600">
                    {date === new Date().toLocaleDateString() ? 'Today' : 
                     date === new Date(Date.now() - 86400000).toLocaleDateString() ? 'Yesterday' : date}
                  </div>
                </div>

                {/* Messages */}
                {msgs.map((message, index) => {
                  const isOwn = message.sender_id === user.id;
                  const showAvatar = !isOwn && (
                    index === msgs.length - 1 || 
                    msgs[index + 1]?.sender_id !== message.sender_id
                  );
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                  <div className="wa-typing-indicator">
                    <div className="wa-typing-dot"></div>
                    <div className="wa-typing-dot"></div>
                    <div className="wa-typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        onAttachment={handleAttachment}
        onVoiceRecord={handleVoiceRecord}
        disabled={uploading}
      />

      {/* Attachment Menu Dialog */}
      <Dialog open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
        <DialogContent className="sm:max-w-md">
          <div className="grid grid-cols-3 gap-4 p-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-[#BF59CF] flex items-center justify-center text-white">
                📄
              </div>
              <span className="text-sm">Document</span>
            </button>
            
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-[#007BFC] flex items-center justify-center text-white">
                📷
              </div>
              <span className="text-sm">Photos</span>
            </button>

            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'video/*';
                  fileInputRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-[#F44336] flex items-center justify-center text-white">
                🎥
              </div>
              <span className="text-sm">Video</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="*/*"
      />
    </div>
  );
};

export default ChatScreen;
