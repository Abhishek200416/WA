import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';

const CallModal = ({ isOpen, onClose, callType, contact, isIncoming = false }) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'ringing' : 'calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { socket } = useSocket();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const durationInterval = useRef(null);

  useEffect(() => {
    if (isOpen && !isIncoming) {
      initializeCall();
    }

    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === 'connected') {
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate call connection after 2 seconds
      setTimeout(() => {
        setCallStatus('connected');
      }, 2000);
    } catch (error) {
      console.error('Failed to get user media:', error);
      toast.error('Failed to access camera/microphone');
      onClose();
    }
  };

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
  };

  const handleEndCall = () => {
    cleanup();
    onClose();
  };

  const handleAccept = () => {
    setCallStatus('connecting');
    initializeCall();
  };

  const handleReject = () => {
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current && callType === 'video') {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Incoming call...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatDuration(duration);
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-[#128C7E] to-[#075E54]">
        <div className="relative w-full h-[600px] flex flex-col">
          {/* Video Display */}
          {callType === 'video' && callStatus === 'connected' && (
            <div className="flex-1 relative">
              {/* Remote video (full screen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Audio call display */}
          {(callType === 'audio' || callStatus !== 'connected') && (
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <Avatar className="w-32 h-32 mb-6 border-4 border-white/20">
                <AvatarImage src={contact?.avatar_url} />
                <AvatarFallback className="bg-white/10 text-white text-4xl">
                  {contact?.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-medium mb-2">{contact?.display_name || 'Unknown'}</h2>
              <p className="text-white/80 text-lg">{getStatusText()}</p>
            </div>
          )}

          {/* Call Controls */}
          <div className="p-6 bg-black/20 backdrop-blur-sm">
            <div className="flex justify-center items-center gap-6">
              {/* Mute */}
              {callStatus === 'connected' && (
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>
              )}

              {/* Video toggle (video calls only) */}
              {callType === 'video' && callStatus === 'connected' && (
                <button
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </button>
              )}

              {/* End/Reject Call */}
              {(callStatus !== 'ringing' || !isIncoming) && (
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
              )}

              {/* Accept Call (incoming only) */}
              {isIncoming && callStatus === 'ringing' && (
                <>
                  <button
                    onClick={handleAccept}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;
