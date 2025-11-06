import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDevice } from '../context/DeviceContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatScreen = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { platform } = useDevice();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChat();
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId) {
      socket.on('new_message', (message) => {
        if (message.chat_id === chatId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          
          // Send delivered receipt
          socket.emit('message_delivered', {
            message_id: message.id,
            user_id: user.id
          });
          
          // Send read receipt if chat is active
          socket.emit('message_read', {
            message_id: message.id,
            user_id: user.id
          });
        }
      });

      socket.on('typing', (data) => {
        if (data.chat_id === chatId && data.user_id !== user.id) {
          setTyping(data.typing);
        }
      });

      socket.on('message_status', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.message_id ? { ...msg, status: data.status } : msg
        ));
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
      setChat(foundChat);
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

  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (socket && text.length > 0) {
      socket.emit('typing_start', {
        chat_id: chatId,
        user_id: user.id
      });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', {
          chat_id: chatId,
          user_id: user.id
        });
      }, 1000);
    } else if (socket && text.length === 0) {
      socket.emit('typing_stop', {
        chat_id: chatId,
        user_id: user.id
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage('');
    setShowEmojiPicker(false);

    // Stop typing indicator
    if (socket) {
      socket.emit('typing_stop', {
        chat_id: chatId,
        user_id: user.id
      });
    }

    try {
      await axios.post(`${API}/messages?user_id=${user.id}`, {
        chat_id: chatId,
        content: messageText,
        message_type: 'text'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(
        `${API}/upload?user_id=${user.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const { file_url, thumbnail_url, filename } = uploadResponse.data;

      let messageType = 'document';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'audio';

      await axios.post(`${API}/messages?user_id=${user.id}`, {
        chat_id: chatId,
        content: filename,
        message_type: messageType,
        attachments: [{
          url: file_url,
          thumbnail: thumbnail_url,
          type: file.type,
          name: filename
        }]
      });

      toast.success('File sent!');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const reactToMessage = async (messageId, emoji) => {
    try {
      await axios.post(`${API}/messages/${messageId}/react?user_id=${user.id}`, null, {
        params: { emoji }
      });
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const getChatName = () => {
    if (!chat) return '';
    if (chat.type === 'group' || chat.type === 'channel') {
      return chat.name;
    }
    // Direct chat - find other user
    return 'Chat';
  };

  const renderMessage = (message, index) => {
    const isSent = message.sender_id === user.id;
    const showTime = index === 0 || 
      (messages[index - 1] && 
       new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 60000);

    return (
      <div key={message.id} className="fade-in">
        {showTime && (
          <div className="text-center my-4">
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        )}
        <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
          <div
            className={`chat-bubble ${isSent ? 'sent' : 'received'} max-w-[75%] shadow-sm`}
            data-testid={`message-${message.id}`}
          >
            {message.message_type === 'image' && message.attachments?.[0] && (
              <img 
                src={`${BACKEND_URL}${message.attachments[0].url}`}
                alt="attachment"
                className="rounded-lg mb-2 max-w-full"
                style={{ maxHeight: '300px' }}
              />
            )}
            {message.message_type === 'text' && (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
            {message.message_type === 'document' && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <Paperclip className="w-5 h-5" />
                </div>
                <span className="text-sm">{message.content}</span>
              </div>
            )}
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-[10px] opacity-70">
                {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isSent && (
                <span className="checkmark" data-status={message.status}>
                  {message.status === 'read' ? (
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                  ) : message.status === 'delivered' ? (
                    <CheckCheck className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Check className="w-4 h-4 text-gray-400" />
                  )}
                </span>
              )}
            </div>
            {message.reactions && message.reactions.length > 0 && (
              <div className="reaction-bar">
                {message.reactions.map((reaction, idx) => (
                  <span key={idx} className="reaction text-xs">
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="chat-screen">
      {/* Header */}
      <div className={`${platform === 'ios' ? 'nav-bar' : platform === 'android' ? 'bg-green-600' : 'bg-white border-b'} px-4 py-3 flex items-center gap-3`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className={platform === 'android' ? 'text-white' : ''}
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={chat.avatar_url} />
          <AvatarFallback className="bg-green-200">{getChatName().charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className={`font-semibold ${platform === 'android' ? 'text-white' : 'text-gray-900'}`}>
            {getChatName()}
          </h2>
          {typing && (
            <p className={`text-sm ${platform === 'android' ? 'text-green-100' : 'text-green-600'}`}>
              typing...
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={platform === 'android' ? 'text-white' : ''}
            data-testid="voice-call-button"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={platform === 'android' ? 'text-white' : ''}
            data-testid="video-call-button"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={platform === 'android' ? 'text-white' : ''}
            data-testid="more-options-button"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556 15.858 12.14 28 0zm4.828 0l14.142 14.142-1.414 1.414L32 .828 17.272 15.556 15.858 14.14 30 0h6.828zM0 15l14.142-14.142 1.414 1.415L2.828 15H0zm0 6l20.142-20.142 1.414 1.415L8.828 15H0zM0 27l32.142-32.142 1.414 1.414L2.828 27H0zm0 6L38.142 0l1.415 1.414L8.828 33H0zm0 6L44.142 0l1.415 1.414L14.828 39H0zm0 6L50.142 0l1.415 1.414L20.828 45H0zm0 6L56.142 0l1.415 1.414L26.828 51H0zm0 6L60 0v6.142L32.828 57H0z' fill='%23000000' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }}>
        <div className="space-y-1">
          {messages.map((message, index) => renderMessage(message, index))}
          {typing && (
            <div className="flex justify-start px-4">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-3">
        {showEmojiPicker && (
          <div className="mb-2">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setNewMessage(prev => prev + emojiData.emoji);
              }}
              width="100%"
              height="350px"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            data-testid="emoji-button"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="attach-button"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 input-field"
            data-testid="message-input"
          />
          {newMessage.trim() ? (
            <Button
              onClick={sendMessage}
              className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10 p-0"
              data-testid="send-button"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              data-testid="voice-record-button"
            >
              <Mic className="w-5 h-5 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
