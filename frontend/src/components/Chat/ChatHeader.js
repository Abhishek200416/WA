import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '@/context/DeviceContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CallModal from '@/components/Call/CallModal';

const ChatHeader = ({ chat, typing = false, online = false }) => {
  const navigate = useNavigate();
  const { type, platform } = useDevice();
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('audio');

  const getChatDisplay = () => {
    if (chat.type === 'direct') {
      return {
        name: chat.otherUser?.display_name || 'Unknown',
        avatar: chat.otherUser?.avatar_url,
        initials: chat.otherUser?.display_name?.charAt(0) || '?',
        subtitle: typing ? 'typing...' : online ? 'online' : 'offline'
      };
    }
    return {
      name: chat.name || 'Group',
      avatar: chat.avatar_url,
      initials: chat.name?.charAt(0) || 'G',
      subtitle: `${chat.participants?.length || 0} participants`
    };
  };

  const display = getChatDisplay();

  return (
    <div className="wa-header bg-[#F0F2F5] border-b border-gray-200 h-[60px] px-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back button for mobile */}
        {type === 'mobile' && (
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-200 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Avatar */}
        <Avatar className="w-10 h-10 cursor-pointer" onClick={() => {/* Open contact info */}}>
          <AvatarImage src={display.avatar} />
          <AvatarFallback className="bg-[#DFE5E7] text-gray-600 text-sm">
            {display.initials}
          </AvatarFallback>
        </Avatar>

        {/* Name and Status */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {/* Open contact info */}}>
          <h2 className="text-[16px] font-normal text-gray-900 truncate">
            {display.name}
          </h2>
          <p className={`text-[13px] truncate ${
            typing ? 'text-[#25D366]' : 'text-gray-500'
          }`}>
            {display.subtitle}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          onClick={() => {
            setCallType('video');
            setShowCallModal(true);
          }}
        >
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          onClick={() => {
            setCallType('audio');
            setShowCallModal(true);
          }}
        >
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Contact info</DropdownMenuItem>
            <DropdownMenuItem>Select messages</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Clear messages</DropdownMenuItem>
            <DropdownMenuItem>Delete chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
