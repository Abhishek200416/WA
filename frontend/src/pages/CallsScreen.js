import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CallsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { type } = useDevice();

  // Mock call history
  const [calls] = useState([
    {
      id: 1,
      contact: { name: 'Alice Johnson', avatar: '', phone: '+1234567890' },
      type: 'video',
      direction: 'incoming',
      status: 'answered',
      duration: '12:34',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      contact: { name: 'Bob Smith', avatar: '', phone: '+1234567891' },
      type: 'audio',
      direction: 'outgoing',
      status: 'answered',
      duration: '5:23',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 3,
      contact: { name: 'Carol Williams', avatar: '', phone: '+1234567892' },
      type: 'video',
      direction: 'incoming',
      status: 'missed',
      duration: '0:00',
      timestamp: new Date(Date.now() - 86400000)
    },
  ]);

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return <PhoneMissed size={18} className="text-red-500" />;
    }
    return call.direction === 'incoming' 
      ? <PhoneIncoming size={18} className="text-[#00A884]" />
      : <PhoneOutgoing size={18} className="text-[#8696A0]" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#111B21] relative">
      <ScrollArea className="flex-1">
        <div className="divide-y divide-[#2A3942]">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-3 p-4 hover:bg-[#202C33] cursor-pointer transition-colors"
              onClick={() => {}}
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={call.contact.avatar} />
                <AvatarFallback className="bg-[#54656F] text-white">
                  {call.contact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[15px] font-medium truncate ${
                    call.status === 'missed' ? 'text-red-500' : 'text-[#E9EDEF]'
                  }`}>
                    {call.contact.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getCallIcon(call)}
                  <span className="text-[#8696A0] text-sm">
                    {formatDistanceToNow(call.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>

              <button className="p-2 hover:bg-[#2A3942] rounded-full transition-colors">
                {call.type === 'video' ? (
                  <Video size={20} className="text-[#00A884]" />
                ) : (
                  <Phone size={20} className="text-[#00A884]" />
                )}
              </button>
            </div>
          ))}
        </div>

        {calls.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Phone size={64} className="text-[#54656F] mb-4" />
            <p className="text-[#E9EDEF] text-lg font-medium mb-2">No calls yet</p>
            <p className="text-[#8696A0] text-sm">Start a call with your contacts</p>
          </div>
        )}
      </ScrollArea>

      {/* Floating Action Button - Mobile only */}
      {type !== 'desktop' && (
        <button
          className="fixed bottom-20 right-6 w-14 h-14 bg-[#00A884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#06CF7A] transition-colors z-10"
          onClick={() => {}}
        >
          <Plus size={24} className="text-white" />
        </button>
      )}
    </div>
  );
};

export default CallsScreen;
