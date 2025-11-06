import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, User, Bell, Lock, Eye, Globe, LogOut, Info, HelpCircle } from 'lucide-react';

const SettingsScreen = () => {
  const { user, updateUser, logout } = useAuth();
  const { platform } = useDevice();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [privacySettings, setPrivacySettings] = useState(user?.privacy_settings || {});

  const handleUpdateProfile = async () => {
    try {
      await updateUser({
        display_name: displayName,
        about: about
      });
      toast.success('Profile updated!');
      setEditingProfile(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handlePrivacyChange = async (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    try {
      await updateUser({ privacy_settings: newSettings });
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="settings-screen">
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
          Settings
        </h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
                <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="edit-profile-button">Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Display Name</label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                          data-testid="display-name-input"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">About</label>
                        <Input
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                          placeholder="About you"
                          data-testid="about-input"
                        />
                      </div>
                      <Button onClick={handleUpdateProfile} className="w-full" data-testid="save-profile-button">
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-green-200 text-green-800 text-2xl">
                    {user?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user?.display_name}</h3>
                  <p className="text-sm text-gray-500">{user?.about || 'Hey there! I am using WA'}</p>
                  <p className="text-sm text-gray-400 mt-1">{user?.phone_number || user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy
              </CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Photo</p>
                  <p className="text-sm text-gray-500">Everyone can see</p>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Last Seen</p>
                  <p className="text-sm text-gray-500">Contacts only</p>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Read Receipts</p>
                  <p className="text-sm text-gray-500">Send and receive</p>
                </div>
                <Switch
                  checked={privacySettings.read_receipts}
                  onCheckedChange={(checked) => handlePrivacyChange('read_receipts', checked)}
                  data-testid="read-receipts-switch"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Online Status</p>
                  <p className="text-sm text-gray-500">Show when online</p>
                </div>
                <Switch
                  checked={privacySettings.online_status}
                  onCheckedChange={(checked) => handlePrivacyChange('online_status', checked)}
                  data-testid="online-status-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message Notifications</p>
                  <p className="text-sm text-gray-500">Show notifications for new messages</p>
                </div>
                <Switch defaultChecked data-testid="message-notifications-switch" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Group Notifications</p>
                  <p className="text-sm text-gray-500">Show notifications for groups</p>
                </div>
                <Switch defaultChecked data-testid="group-notifications-switch" />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                <p className="font-medium">Two-Step Verification</p>
                <Button variant="ghost" size="sm">Set up</Button>
              </div>
              <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                <p className="font-medium">Linked Devices</p>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <p className="font-medium">Version</p>
                <p className="text-sm text-gray-500">1.0.0</p>
              </div>
              <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                <p className="font-medium">Help Center</p>
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                <p className="font-medium">Privacy Policy</p>
                <Globe className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>

          <div className="text-center text-sm text-gray-500 pb-4">
            <p>WA - Simple. Secure. Reliable.</p>
            <p className="mt-1">End-to-end encrypted</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SettingsScreen;
