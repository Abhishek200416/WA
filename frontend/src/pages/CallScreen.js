import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useDevice } from '../context/DeviceContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

const CallScreen = () => {
  const { callId } = useParams();
  const [callStatus, setCallStatus] = useState('ringing'); // ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { platform } = useDevice();
  const navigate = useNavigate();

  useEffect(() => {
    initializeCall();
    return () => {
      cleanupCall();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('call_signal', handleCallSignal);
      return () => {
        socket.off('call_signal');
      };
    }
  }, [socket]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup WebRTC
      setupPeerConnection(stream);
    } catch (error) {
      console.error('Failed to get user media:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const setupPeerConnection = (stream) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus('connected');
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('call_signal', {
          target_user_id: 'other_user_id', // Should get from call data
          signal: {
            type: 'ice',
            candidate: event.candidate
          }
        });
      }
    };

    // Create and send offer
    createOffer(peerConnection);
  };

  const createOffer = async (peerConnection) => {
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (socket) {
        socket.emit('call_signal', {
          target_user_id: 'other_user_id',
          signal: {
            type: 'offer',
            sdp: offer
          }
        });
      }
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };

  const handleCallSignal = async (data) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;

    try {
      if (data.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        if (socket) {
          socket.emit('call_signal', {
            target_user_id: data.from_user_id,
            signal: {
              type: 'answer',
              sdp: answer
            }
          });
        }
      } else if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === 'ice') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch (error) {
      console.error('Failed to handle call signal:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    cleanupCall();
    navigate('/');
    toast.info('Call ended');
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col" data-testid="call-screen">
      {/* Remote Video */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (PiP) */}
        <div className="absolute top-4 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Call Info */}
        <div className="absolute top-4 left-4 text-white">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Contact</p>
              <p className="text-sm opacity-75">
                {callStatus === 'ringing' ? 'Ringing...' : 
                 callStatus === 'connected' ? 'Connected' : 'Ended'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}
            onClick={toggleMute}
            data-testid="mute-button"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`w-14 h-14 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}
            onClick={toggleVideo}
            data-testid="video-toggle-button"
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
            onClick={endCall}
            data-testid="end-call-button"
          >
            <PhoneOff className="w-7 h-7" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;
