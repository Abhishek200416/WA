import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, User, Bell, Lock, Eye, Key, HelpCircle, Info, 
  ChevronRight, QrCode, LogOut, Moon, MessageSquare, Database
} from 'lucide-react';
import PrivacySettings from '@/components/Settings/PrivacySettings';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsScreen = () => {
  const { user, setUser, logout } = useAuth();
  const { type, platform } = useDevice();
  const navigate = useNavigate();
  
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [about, setAbout] = useState(user?.about || 'Hey there! I am using WA.');
  const [username, setUsername] = useState(user?.username || '');

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.patch(`${API}/users/me?user_id=${user.id}`, {
        display_name: displayName,
        about: about,
        username: username
      });
      
      setUser(response.data);
      toast.success('Profile updated successfully');
      setShowProfileEdit(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  const SettingsItem = ({ icon: Icon, title, subtitle, onClick, showArrow = true }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
    >
      <div className="w-10 h-10 rounded-full bg-[#00A884]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#00A884]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
      </div>
      {showArrow && <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
    </div>
  );

  const SettingsSection = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );

  if (showPrivacy) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-[#F0F2F5] border-b border-gray-200 h-[60px] px-4 flex items-center gap-3">
          <button
            onClick={() => setShowPrivacy(false)}
            className="p-2 hover:bg-gray-200 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-normal text-gray-900">Privacy</h1>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <PrivacySettings />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#F0F2F5] border-b border-gray-200 h-[60px] px-4 flex items-center gap-3">
        {type === 'mobile' && (
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-200 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-xl font-normal text-gray-900">Settings</h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div 
            className="bg-white p-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowProfileEdit(true)}
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-[#DFE5E7] text-gray-600 text-xl">
                  {user?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-medium text-gray-900">{user?.display_name || 'User'}</h2>
                <p className="text-sm text-gray-500 truncate">{user?.about || 'Hey there! I am using WA.'}</p>
              </div>
              <QrCode className="w-6 h-6 text-[#00A884]" />
            </div>
          </div>

          {/* Settings Sections */}
          <div className="p-4 space-y-4">
            <SettingsSection>
              <SettingsItem
                icon={Key}
                title="Account"
                subtitle="Privacy, security, change number"
                onClick={() => {/* TODO */}}
              />
              <SettingsItem
                icon={Lock}
                title="Privacy"
                subtitle="Block contacts, disappearing messages"
                onClick={() => setShowPrivacy(true)}
              />
              <SettingsItem
                icon={MessageSquare}
                title="Chats"
                subtitle="Theme, wallpapers, chat history"
                onClick={() => {/* TODO */}}
              />
              <SettingsItem
                icon={Bell}
                title="Notifications"
                subtitle="Message, group & call tones"
                onClick={() => {/* TODO */}}
              />
              <SettingsItem
                icon={Database}
                title="Storage and data"
                subtitle="Network usage, auto-download"
                onClick={() => {/* TODO */}}
              />
            </SettingsSection>

            <SettingsSection>
              <SettingsItem
                icon={HelpCircle}
                title="Help"
                subtitle="Help center, contact us, privacy policy"
                onClick={() => {/* TODO */}}
              />
              <SettingsItem
                icon={Info}
                title="About WA"
                subtitle="Version 1.0.0"
                showArrow={false}
                onClick={() => {/* TODO */}}
              />
            </SettingsSection>

            <SettingsSection>
              <SettingsItem
                icon={LogOut}
                title="Log out"
                subtitle=""
                showArrow={false}
                onClick={handleLogout}
              />
            </SettingsSection>

            {/* Footer Info */}
            <div className="text-center py-6 text-sm text-gray-500">
              <p>from</p>
              <p className="font-semibold text-gray-700 mt-1">EMERGENT</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-[#DFE5E7] text-gray-600 text-4xl">
                  {displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button className="text-[#00A884] text-sm font-medium hover:underline">
                Change profile photo
              </button>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 px-0 focus-visible:ring-0"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 px-0 focus-visible:ring-0"
              />
              <p className="text-xs text-gray-400 mt-1">
                This is not your phone number. Other users can find you by this username.
              </p>
            </div>

            {/* About */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">About</label>
              <Input
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Your status"
                className="border-b border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 px-0 focus-visible:ring-0"
              />
            </div>

            {/* Phone Number (Read-only with privacy info) */}
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Phone</label>
              <div className="text-gray-700 pb-2 border-b border-gray-200">
                {user?.phone_number || 'Not set'}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Your phone number visibility can be changed in Privacy settings
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowProfileEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProfile}
                className="flex-1 bg-[#00A884] hover:bg-[#017561]"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsScreen;
