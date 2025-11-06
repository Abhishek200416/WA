import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatListItem = ({ chat, user, onClick, isActive = false }) => {
  const getChatDisplay = () => {
    if (chat.type === 'direct') {
      const otherUser = chat.otherUser;
      return {
        name: otherUser?.display_name || 'Unknown',
        avatar: otherUser?.avatar_url,
        initials: otherUser?.display_name?.charAt(0) || '?'
      };
    }
    return {
      name: chat.name || 'Group',
      avatar: chat.avatar_url,
      initials: chat.name?.charAt(0) || 'G'
    };
  };

  const getLastMessagePreview = () => {
    if (!chat.last_message) return 'No messages yet';
    
    const msg = chat.last_message;
    let preview = '';
    
    if (msg.sender_id === user.id) {
      preview = '';
    }
    
    if (msg.message_type === 'text') {
      preview += msg.content;
    } else if (msg.message_type === 'image') {
      preview += '📷 Photo';
    } else if (msg.message_type === 'video') {
      preview += '🎥 Video';
    } else if (msg.message_type === 'audio') {
      preview += '🎤 Audio';
    } else if (msg.message_type === 'document') {
      preview += '📄 Document';
    }
    
    return preview.length > 50 ? preview.slice(0, 50) + '...' : preview;
  };

  const getLastMessageTime = () => {
    if (!chat.last_message) return '';
    try {
      const date = new Date(chat.last_message.created_at);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  const getStatusIcon = () => {
    if (!chat.last_message || chat.last_message.sender_id !== user.id) return null;
    
    switch (chat.last_message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-[#53BDEB]" />;
      default:
        return null;
    }
  };

  const display = getChatDisplay();
  const unreadCount = chat.unread_count || 0;
  const isMuted = chat.is_muted || false;

  return (
    <div
      onClick={onClick}
      className={`wa-chat-item flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
        isActive ? 'bg-[#F0F2F5]' : 'bg-white'
      }`}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12 mr-3 flex-shrink-0">
        <AvatarImage src={display.avatar} />
        <AvatarFallback className="bg-[#DFE5E7] text-gray-600 text-sm font-medium">
          {display.initials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[16px] font-normal text-gray-900 truncate">
            {display.name}
          </h3>
          <span className="text-[12px] text-gray-500 ml-2 flex-shrink-0">
            {getLastMessageTime()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {getStatusIcon()}
            <p className="text-[14px] text-gray-600 truncate">
              {getLastMessagePreview()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {isMuted && (
              <Volume2 className="w-4 h-4 text-gray-400" />
            )}
            {unreadCount > 0 && (
              <div className="wa-unread-badge bg-[#25D366] text-white rounded-full px-1.5 py-0.5 text-[12px] font-semibold min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
