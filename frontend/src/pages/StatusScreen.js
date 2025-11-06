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
import { Plus, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusScreen = () => {
  const [statuses, setStatuses] = useState([]);
  const [viewingStatus, setViewingStatus] = useState(null);
  const { user } = useAuth();
  const { type } = useDevice();
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
    setTimeout(() => {
      setViewingStatus(null);
    }, 5000);
  };

  return (
    <div className="h-full flex flex-col bg-[#111B21]">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* My Status */}
          <div>
            <h2 className="text-sm font-semibold text-[#8696A0] mb-3">MY STATUS</h2>
            <div className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#202C33] rounded-lg transition-colors" onClick={createStatus}>
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-[#54656F] text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-[#00A884] rounded-full p-1">
                  <Plus size={14} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-[#E9EDEF] font-medium">My status</p>
                <p className="text-[#8696A0] text-sm">Tap to add status update</p>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          {statuses.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#8696A0] mb-3">RECENT UPDATES</h2>
              <div className="space-y-2">
                {statuses.map((statusGroup, index) => {
                  const status = statusGroup[0];
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#202C33] rounded-lg transition-colors"
                      onClick={() => viewStatus(statusGroup)}
                    >
                      <div className="relative">
                        <Avatar className="w-14 h-14 ring-2 ring-[#00A884]">
                          <AvatarImage src={status.user?.avatar} />
                          <AvatarFallback className="bg-[#54656F] text-white">
                            {status.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <p className="text-[#E9EDEF] font-medium">{status.user?.name || 'User'}</p>
                        <p className="text-[#8696A0] text-sm">
                          {formatDistanceToNow(new Date(status.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Clock size={16} className="text-[#8696A0]" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {statuses.length === 0 && (
            <div className="text-center py-12">
              <Eye size={64} className="text-[#54656F] mx-auto mb-4" />
              <p className="text-[#8696A0]">No status updates yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Status Viewer Dialog */}
      {viewingStatus && (
        <Dialog open={!!viewingStatus} onOpenChange={() => setViewingStatus(null)}>
          <DialogContent className="bg-[#111B21] border-[#2A3942]">
            <div className="text-center p-8">
              <p className="text-[#E9EDEF] text-xl">{viewingStatus.content}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StatusScreen;
