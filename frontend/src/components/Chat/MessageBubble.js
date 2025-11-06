import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck, Smile, Reply, MoreVertical, Trash2, Edit2, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn, onReply, onEdit, onDelete, onReact, senderName, senderAvatar }) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const renderStatus = () => {
    if (!isOwn) return null;
    
    const status = message.status;
    if (status === 'read') {
      return <CheckCheck size={16} className="text-[#53BDEB]" />;
    } else if (status === 'delivered') {
      return <CheckCheck size={16} className="text-[#8696A0]" />;
    } else {
      return <Check size={16} className="text-[#8696A0]" />;
    }
  };

  const renderAttachment = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return message.attachments.map((attachment, index) => {
      if (attachment.type === 'image') {
        return (
          <img
            key={index}
            src={attachment.url}
            alt="attachment"
            className="max-w-[300px] rounded-lg mb-2"
          />
        );
      } else if (attachment.type === 'video') {
        return (
          <video
            key={index}
            src={attachment.url}
            controls
            className="max-w-[300px] rounded-lg mb-2"
          />
        );
      } else {
        return (
          <div key={index} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg mb-2">
            <div className="flex-1">
              <p className="text-sm font-medium">{attachment.name}</p>
              <p className="text-xs text-[#8696A0]">{attachment.size}</p>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div
      className={`flex gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback className="bg-[#54656F] text-white text-xs">
            {senderName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex items-end gap-2 max-w-[65%]">
        {/* Message Actions (Left side for own messages) */}
        {isOwn && showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-[#2A3942] rounded-full transition-colors opacity-70 hover:opacity-100">
                <MoreVertical size={16} className="text-[#8696A0]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply size={16} className="mr-2" /> Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReact(message)}>
                <Smile size={16} className="mr-2" /> React
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.text)}>
                <Copy size={16} className="mr-2" /> Copy
              </DropdownMenuItem>
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    <Edit2 size={16} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(message)} className="text-red-500">
                    <Trash2 size={16} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Message Bubble */}
        <div
          className={`wa-message-bubble relative ${
            isOwn ? 'wa-message-outgoing' : 'wa-message-incoming'
          }`}
        >
          {!isOwn && message.sender_name && (
            <p className="text-xs font-semibold text-[#25D366] mb-1">{senderName}</p>
          )}
          
          {message.reply_to && (
            <div className="bg-black/10 border-l-4 border-[#25D366] pl-2 py-1 mb-2 text-xs">
              <p className="font-semibold text-[#25D366]">{message.reply_to.sender_name}</p>
              <p className="text-[#8696A0]">{message.reply_to.text}</p>
            </div>
          )}

          {renderAttachment()}
          
          {message.text && (
            <p className={`text-sm ${isOwn ? 'text-[#111B21]' : 'text-[#E9EDEF]'} whitespace-pre-wrap break-words`}>
              {message.text}
            </p>
          )}
          
          {message.edited && (
            <span className="text-xs text-[#8696A0] italic"> (edited)</span>
          )}
          
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={`text-xs ${isOwn ? 'text-[#667781]' : 'text-[#8696A0]'}`}>
              {formatTime(message.timestamp)}
            </span>
            {renderStatus()}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="wa-reaction">
              {message.reactions.slice(0, 3).map((r, i) => r.emoji).join(' ')}
              {message.reactions.length > 3 && ` +${message.reactions.length - 3}`}
            </div>
          )}
        </div>

        {/* Message Actions (Right side for other messages) */}
        {!isOwn && showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-[#2A3942] rounded-full transition-colors opacity-70 hover:opacity-100">
                <MoreVertical size={16} className="text-[#8696A0]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply size={16} className="mr-2" /> Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReact(message)}>
                <Smile size={16} className="mr-2" /> React
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.text)}>
                <Copy size={16} className="mr-2" /> Copy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
