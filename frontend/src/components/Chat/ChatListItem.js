import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatListItem = ({ chat, onClick, active = false }) => {
  const getDisplayName = () => {
    if (chat.type === 'group') return chat.name;
    return chat.otherUser?.name || chat.otherUser?.username || 'Unknown';
  };

  const getAvatar = () => {
    if (chat.type === 'group') return chat.avatar;
    return chat.otherUser?.avatar;
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours - show time
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    // Less than 7 days - show day
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    // Older - show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderMessageStatus = () => {
    if (!chat.last_message) return null;
    if (chat.last_message.sender_id !== chat.current_user_id) return null;

    const status = chat.last_message.status;
    if (status === 'read') {
      return <CheckCheck size={16} className="text-[#53BDEB]" />;
    } else if (status === 'delivered') {
      return <CheckCheck size={16} className="text-[#8696A0]" />;
    } else {
      return <Check size={16} className="text-[#8696A0]" />;
    }
  };

  const getLastMessageText = () => {
    if (!chat.last_message) return 'No messages yet';
    const msg = chat.last_message.text || 'Media';
    return msg.length > 30 ? msg.substring(0, 30) + '...' : msg;
  };

  return (
    <div
      onClick={onClick}
      className={`wa-chat-item flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[#202C33] ${
        active ? 'bg-[#2A3942]' : ''
      }`}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12 flex-shrink-0">
        <AvatarImage src={getAvatar()} alt={getDisplayName()} />
        <AvatarFallback className="bg-[#54656F] text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      {/* Chat Info */}
      <div className="flex-1 min-w-0 border-b border-[#2A3942] pb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-[#E9EDEF] truncate">{getDisplayName()}</h3>
          <span className="text-xs text-[#8696A0] flex-shrink-0">
            {chat.last_message?.timestamp && formatTime(chat.last_message.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            {renderMessageStatus()}
            <p className="text-sm text-[#8696A0] truncate">
              {getLastMessageText()}
            </p>
          </div>
          
          {chat.unread_count > 0 && (
            <span className="wa-unread-badge flex-shrink-0">
              {chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
