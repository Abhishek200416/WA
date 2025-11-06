import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft, User, Bell, Lock, Info, HelpCircle, LogOut,
  ChevronRight, Moon, Sun, Phone, Eye, MessageSquare,
  Shield, Archive, Database, Zap
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { type } = useDevice();
  const [darkMode, setDarkMode] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    about: user?.about || 'Hey there! I am using WA'
  });

  const [privacySettings, setPrivacySettings] = useState({
    show_phone: user?.privacy_settings?.show_phone ?? true,
    show_last_seen: user?.privacy_settings?.show_last_seen ?? true,
    show_profile_photo: user?.privacy_settings?.show_profile_photo ?? true,
    show_about: user?.privacy_settings?.show_about ?? true,
    show_status: user?.privacy_settings?.show_status ?? true
  });

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put(`${API}/users/me?user_id=${user.id}`, profileData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
      setEditingProfile(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePrivacyChange = async (key, value) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    
    try {
      await axios.put(`${API}/users/me?user_id=${user.id}`, {
        privacy_settings: newSettings
      });
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update privacy settings');
    }
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, trailing }) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 hover:bg-[#202C33] cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} className="text-[#8696A0]" />}
        <div>
          <p className="text-[#E9EDEF] text-sm">{title}</p>
          {subtitle && <p className="text-[#8696A0] text-xs">{subtitle}</p>}
        </div>
      </div>
      {trailing || <ChevronRight size={18} className="text-[#8696A0]" />}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#111B21]">
      {/* Header */}
      <div className="h-[60px] bg-[#202C33] border-b border-[#2A3942] px-4 flex items-center gap-4">
        {type !== 'desktop' && (
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#2A3942] rounded-full">
            <ArrowLeft size={20} className="text-[#AEBAC1]" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-[#E9EDEF]">Settings</h1>
      </div>

      <ScrollArea className="flex-1">
        {/* Profile Section */}
        <div className="bg-[#202C33] p-6 mb-2">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#54656F] text-white text-2xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {editingProfile ? (
                <div className="space-y-2">
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Name"
                    className="bg-[#2A3942] border-none text-white h-9"
                  />
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="@username"
                    className="bg-[#2A3942] border-none text-white h-9"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-[#E9EDEF] text-xl font-semibold">{user?.name || 'User'}</h2>
                  <p className="text-[#8696A0] text-sm">@{user?.username || 'username'}</p>
                </>
              )}
            </div>
          </div>
          
          {editingProfile ? (
            <>
              <Label className="text-[#8696A0] text-xs mb-2">About</Label>
              <Input
                value={profileData.about}
                onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                placeholder="About"
                className="bg-[#2A3942] border-none text-white mb-3"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-[#25D366] hover:bg-[#1FAF54] text-white"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(false)}
                  className="flex-1 border-[#2A3942] text-[#8696A0] hover:bg-[#2A3942]"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[#8696A0] text-sm mb-3">{user?.about || 'Hey there! I am using WA'}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(true)}
                className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
              >
                <User size={16} className="mr-2" /> Edit Profile
              </Button>
            </>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">ACCOUNT</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          <SettingItem
            icon={Phone}
            title="Phone"
            subtitle={user?.phone || '+1 234 567 8900'}
          />
          <SettingItem
            icon={User}
            title="Username"
            subtitle={`@${user?.username || 'username'}`}
          />
          <SettingItem
            icon={MessageSquare}
            title="About"
            subtitle={user?.about || 'Hey there! I am using WA'}
          />
        </div>

        {/* Privacy Settings */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">PRIVACY</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          
          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#111B21] transition-colors">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-[#8696A0]" />
              <div>
                <p className="text-[#E9EDEF] text-sm">Show phone number</p>
                <p className="text-[#8696A0] text-xs">Let contacts see your phone</p>
              </div>
            </div>
            <Switch
              checked={privacySettings.show_phone}
              onCheckedChange={(checked) => handlePrivacyChange('show_phone', checked)}
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#111B21] transition-colors">
            <div className="flex items-center gap-3">
              <Eye size={20} className="text-[#8696A0]" />
              <div>
                <p className="text-[#E9EDEF] text-sm">Last seen</p>
                <p className="text-[#8696A0] text-xs">Show when you were last online</p>
              </div>
            </div>
            <Switch
              checked={privacySettings.show_last_seen}
              onCheckedChange={(checked) => handlePrivacyChange('show_last_seen', checked)}
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#111B21] transition-colors">
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#8696A0]" />
              <div>
                <p className="text-[#E9EDEF] text-sm">Profile photo</p>
                <p className="text-[#8696A0] text-xs">Who can see your profile picture</p>
              </div>
            </div>
            <Switch
              checked={privacySettings.show_profile_photo}
              onCheckedChange={(checked) => handlePrivacyChange('show_profile_photo', checked)}
            />
          </div>

          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#111B21] transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-[#8696A0]" />
              <div>
                <p className="text-[#E9EDEF] text-sm">About</p>
                <p className="text-[#8696A0] text-xs">Who can see your about info</p>
              </div>
            </div>
            <Switch
              checked={privacySettings.show_about}
              onCheckedChange={(checked) => handlePrivacyChange('show_about', checked)}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">NOTIFICATIONS</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          <SettingItem
            icon={Bell}
            title="Message notifications"
            subtitle="Sound, vibration, popup"
          />
          <SettingItem
            icon={Bell}
            title="Group notifications"
            subtitle="Sound, vibration, popup"
          />
          <SettingItem
            icon={Bell}
            title="Call notifications"
            subtitle="Ringtone and vibration"
          />
        </div>

        {/* Appearance */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">APPEARANCE</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          <div className="px-4 py-3 flex items-center justify-between hover:bg-[#111B21] transition-colors">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-[#8696A0]" /> : <Sun size={20} className="text-[#8696A0]" />}
              <div>
                <p className="text-[#E9EDEF] text-sm">Dark mode</p>
                <p className="text-[#8696A0] text-xs">Currently {darkMode ? 'enabled' : 'disabled'}</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <SettingItem
            icon={MessageSquare}
            title="Chat wallpaper"
            subtitle="Default WhatsApp background"
          />
        </div>

        {/* Security */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">SECURITY</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          <SettingItem
            icon={Lock}
            title="Two-step verification"
            subtitle="Add extra security"
          />
          <SettingItem
            icon={Shield}
            title="Show security notifications"
            subtitle="Get notified of security changes"
          />
        </div>

        {/* Storage */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">STORAGE</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          <SettingItem
            icon={Database}
            title="Storage usage"
            subtitle="Manage storage and network usage"
          />
          <SettingItem
            icon={Archive}
            title="Archived chats"
            subtitle="View archived conversations"
          />
        </div>

        {/* Help */}
        <div className="bg-[#202C33] mb-2">
          <div className="px-4 py-3">
            <h3 className="text-[#25D366] text-sm font-semibold">HELP</h3>
          </div>
          <Separator className="bg-[#2A3942]" />
          <SettingItem
            icon={HelpCircle}
            title="Help center"
            subtitle="Get support and FAQs"
          />
          <SettingItem
            icon={Info}
            title="App info"
            subtitle="Version 1.0.0"
          />
        </div>

        {/* Logout */}
        <div className="bg-[#202C33] mb-4">
          <div
            onClick={logout}
            className="flex items-center gap-3 px-4 py-4 hover:bg-[#111B21] cursor-pointer transition-colors"
          >
            <LogOut size={20} className="text-red-500" />
            <p className="text-red-500 text-sm font-medium">Log out</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SettingsScreen;
