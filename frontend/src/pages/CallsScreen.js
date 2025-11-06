import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Video, PhoneCall, PhoneMissed, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CallsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Demo call history
  useEffect(() => {
    // In a real app, fetch from backend
    setCalls([
      {
        id: '1',
        contact: { name: 'Alice Johnson', avatar: '', phone: '+1234567890' },
        type: 'video',
        direction: 'outgoing',
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 245
      },
      {
        id: '2',
        contact: { name: 'Bob Smith', avatar: '', phone: '+1234567891' },
        type: 'audio',
        direction: 'incoming',
        status: 'missed',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        duration: 0
      },
      {
        id: '3',
        contact: { name: 'Carol Williams', avatar: '', phone: '+1234567892' },
        type: 'audio',
        direction: 'outgoing',
        status: 'completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 567
      }
    ]);
  }, []);

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    }
    if (call.direction === 'incoming') {
      return <PhoneIncoming className="h-4 w-4 text-[#25D366]" />;
    }
    return <PhoneOutgoing className="h-4 w-4 text-[#25D366]" />;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B141A]">
      {/* Header */}
      <div className="bg-[#1F2C34] p-4 border-b border-[#2A3942]">
        <h1 className="text-white text-xl font-semibold">Calls</h1>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <PhoneCall className="h-20 w-20 text-[#8696A0] mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Calls Yet</h3>
            <p className="text-[#8696A0] text-sm">
              Make voice and video calls with your contacts
            </p>
          </div>
        ) : (
          <div>
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-3 p-4 hover:bg-[#1F2C34] cursor-pointer border-b border-[#2A3942]"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={call.contact.avatar} />
                  <AvatarFallback className="bg-[#25D366] text-white">
                    {call.contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{call.contact.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#8696A0]">
                    {getCallIcon(call)}
                    <span>
                      {call.status === 'missed' ? 'Missed' : call.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                    </span>
                    {call.status === 'completed' && (
                      <span>• {formatDuration(call.duration)}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-[#8696A0]">
                    {formatTimestamp(call.timestamp)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-[#2A3942]"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Initiate call
                    }}
                  >
                    {call.type === 'video' ? (
                      <Video className="h-5 w-5 text-[#25D366]" />
                    ) : (
                      <Phone className="h-5 w-5 text-[#25D366]" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for New Call (Android style) */}
      <Button
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BD5F] shadow-lg"
        onClick={() => navigate('/new-call')}
      >
        <PhoneCall className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
};

export default CallsScreen;
