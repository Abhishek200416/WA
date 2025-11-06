import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusScreen = () => {
  const [statuses, setStatuses] = useState([]);
  const [viewingStatus, setViewingStatus] = useState(null);
  const { user } = useAuth();
  const { platform } = useDevice();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await axios.get(`${API}/status?user_id=${user.id}`);
      
      // Group statuses by user
      const grouped = response.data.reduce((acc, status) => {
        if (!acc[status.user_id]) {
          acc[status.user_id] = [];
        }
        acc[status.user_id].push(status);
        return acc;
      }, {});
      
      setStatuses(Object.values(grouped));
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    }
  };

  const createStatus = async () => {
    // Simple text status for demo
    try {
      await axios.post(`${API}/status?user_id=${user.id}`, {
        content_type: 'text',
        content: 'Hey! Check out my status',
        background_color: '#25D366'
      });
      toast.success('Status posted!');
      fetchStatuses();
    } catch (error) {
      toast.error('Failed to post status');
    }
  };

  const viewStatus = (statusGroup) => {
    setViewingStatus(statusGroup[0]);
    // Auto advance through statuses
    setTimeout(() => {
      setViewingStatus(null);
    }, 5000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="status-screen">
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
        <h1 className={`text-xl font-semibold ${platform === 'android' ? 'text-white' : 'text-gray-900'}`}>
          Status
        </h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* My Status */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">MY STATUS</h2>
            <div className="flex items-center gap-3 cursor-pointer" onClick={createStatus}>
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-green-200 text-green-800">
                    {user?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <p className="font-medium">My Status</p>
                <p className="text-sm text-gray-500">Tap to add status update</p>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          {statuses.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">RECENT UPDATES</h2>
              <div className="space-y-3">
                {statuses.map((statusGroup, index) => {
                  const status = statusGroup[0];
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                      onClick={() => viewStatus(statusGroup)}
                    >
                      <div className="status-ring">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-200">U</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Contact</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(status.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status Viewer Dialog */}
      <Dialog open={!!viewingStatus} onOpenChange={() => setViewingStatus(null)}>
        <DialogContent className="max-w-lg h-[600px] p-0 bg-black border-0" data-testid="status-viewer">
          {viewingStatus && (
            <div className="relative h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingStatus(null)}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
              
              {/* Progress Bar */}
              <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-progress" style={{ animation: 'progress 5s linear' }} />
              </div>

              {/* Status Content */}
              <div className="text-center p-8">
                {viewingStatus.content_type === 'text' ? (
                  <div
                    className="text-white text-3xl font-medium"
                    style={{ backgroundColor: viewingStatus.background_color }}
                  >
                    <p className="p-12 rounded-lg">{viewingStatus.content}</p>
                  </div>
                ) : viewingStatus.content_type === 'image' ? (
                  <img 
                    src={`${BACKEND_URL}${viewingStatus.media_url}`}
                    alt="status"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StatusScreen;
