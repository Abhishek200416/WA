import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
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

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const renderContent = () => {
    if (message.message_type === 'image' && message.attachments?.length > 0) {
      return (
        <div className="mb-1">
          <img 
            src={message.attachments[0].url} 
            alt="" 
            className="rounded-lg max-w-full max-h-[300px] object-cover"
          />
          {message.content && (
            <p className="mt-2 text-sm">{message.content}</p>
          )}
        </div>
      );
    }

    if (message.message_type === 'video' && message.attachments?.length > 0) {
      return (
        <div className="mb-1">
          <video 
            src={message.attachments[0].url} 
            controls 
            className="rounded-lg max-w-full max-h-[300px]"
          />
          {message.content && (
            <p className="mt-2 text-sm">{message.content}</p>
          )}
        </div>
      );
    }

    if (message.message_type === 'audio' && message.attachments?.length > 0) {
      return (
        <div className="flex items-center gap-2">
          <audio src={message.attachments[0].url} controls className="max-w-full" />
        </div>
      );
    }

    if (message.message_type === 'document' && message.attachments?.length > 0) {
      return (
        <div className="flex items-center gap-2 p-2 bg-white/10 rounded">
          <div className="text-2xl">📄</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.attachments[0].filename}</p>
            <p className="text-xs text-gray-500">{(message.attachments[0].size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      );
    }

    return <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div className={`flex items-end gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
      )}
      
      <div
        className={`relative max-w-[65%] px-2 py-1.5 rounded-lg shadow-sm ${
          isOwn
            ? 'bg-[#D9FDD3] rounded-br-none'
            : 'bg-white rounded-bl-none'
        }`}
      >
        {message.reply_to && (
          <div className="mb-2 p-2 bg-black/5 rounded border-l-4 border-[#06CF9C]">
            <p className="text-xs text-gray-600 font-semibold mb-1">Reply</p>
            <p className="text-xs text-gray-700 truncate">Previous message...</p>
          </div>
        )}
        
        {renderContent()}
        
        {message.is_edited && (
          <span className="text-[11px] text-gray-500 mr-1">edited</span>
        )}
        
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[11px] text-gray-500">
            {formatTime(message.created_at)}
          </span>
          {getStatusIcon()}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="wa-reaction">
            {message.reactions.map((r, i) => (
              <span key={i}>{r.emoji}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
