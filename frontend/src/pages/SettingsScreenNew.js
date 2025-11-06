import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  ArrowLeft, User, Bell, Lock, Info, HelpCircle, LogOut,
  ChevronRight, Phone, Eye, MessageSquare, Shield, Archive,
  Database, Star, Link2, Users, Mail, QrCode
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SettingsScreenNew = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { type } = useDevice();

  const [privacySettings, setPrivacySettings] = useState({
    show_phone: user?.privacy_settings?.show_phone ?? true,
    show_last_seen: user?.privacy_settings?.show_last_seen ?? true,
    show_profile_photo: user?.privacy_settings?.show_profile_photo ?? true,
    show_about: user?.privacy_settings?.show_about ?? true,
  });

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

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, showChevron = true, trailing }) => (
    <div
      onClick={onClick}
      className="flex items-center px-5 py-4 hover:bg-[#111B21] cursor-pointer transition-colors active:bg-[#2A3942]"
    >
      <div className="flex items-center gap-4 flex-1">
        {Icon && <Icon size={22} className="text-[#8696A0]" />}
        <div className="flex-1">
          <p className="text-[#E9EDEF] text-[15px] font-normal leading-tight">{title}</p>
          {subtitle && <p className="text-[#8696A0] text-[13px] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {trailing || (showChevron && <ChevronRight size={20} className="text-[#8696A0]" />)}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="px-5 py-3 bg-[#111B21]">
      <h3 className="text-[#00A884] text-[13px] font-semibold tracking-wide">{title}</h3>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#111B21]">
      {/* Header */}
      <div className="bg-[#202C33] border-b border-[#2A3942]">
        <div className="h-[60px] px-4 flex items-center gap-4">
          {type !== 'desktop' && (
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#2A3942] rounded-full -ml-2">
              <ArrowLeft size={22} className="text-[#AEBAC1]" />
            </button>
          )}
          <h1 className="text-xl font-medium text-[#E9EDEF]">Settings</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Profile Section */}
        <div className="bg-[#202C33] mb-[10px] cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="px-5 py-6 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#54656F] text-white text-xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-[#E9EDEF] text-lg font-medium">{user?.name || 'User'}</h2>
              <p className="text-[#8696A0] text-sm mt-0.5">{user?.about || 'Hey there! I am using WA'}</p>
            </div>
            <ChevronRight size={22} className="text-[#8696A0]" />
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={QrCode}
            title="QR code"
            subtitle="Scan to connect"
          />
        </div>

        {/* Account Section */}
        <SectionHeader title="ACCOUNT" />
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={User}
            title="Account"
            subtitle="Security notifications, change number"
          />
          <div className="border-t border-[#2A3942]" />
          <SettingItem
            icon={Lock}
            title="Privacy"
            subtitle="Block contacts, disappearing messages"
          />
          <div className="border-t border-[#2A3942]" />
          <SettingItem
            icon={User}
            title="Avatar"
            subtitle="Create, edit, profile photo"
          />
        </div>

        {/* Lists Section */}
        <SectionHeader title="LISTS" />
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={Star}
            title="Starred messages"
          />
          <div className="border-t border-[#2A3942]" />
          <SettingItem
            icon={Link2}
            title="Linked devices"
          />
        </div>

        {/* Chats Section */}
        <SectionHeader title="CHATS" />
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={MessageSquare}
            title="Chats"
            subtitle="Theme, wallpapers, chat history"
          />
          <div className="border-t border-[#2A3942]" />
          <SettingItem
            icon={Archive}
            title="Archived"
          />
        </div>

        {/* Notifications Section */}
        <SectionHeader title="NOTIFICATIONS" />
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Message, group & call tones"
          />
        </div>

        {/* Storage Section */}
        <SectionHeader title="STORAGE" />
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={Database}
            title="Storage and data"
            subtitle="Network usage, auto-download"
          />
        </div>

        {/* Help Section */}
        <SectionHeader title="HELP" />
        <div className="bg-[#202C33] mb-[10px]">
          <SettingItem
            icon={HelpCircle}
            title="Help"
            subtitle="Help center, contact us, privacy policy"
          />
          <div className="border-t border-[#2A3942]" />
          <SettingItem
            icon={Users}
            title="Invite a friend"
          />
        </div>

        {/* App Info */}
        <div className="px-5 py-6 text-center">
          <p className="text-[#8696A0] text-sm">from</p>
          <p className="text-[#8696A0] text-sm font-semibold mt-1">WA</p>
          <p className="text-[#8696A0] text-xs mt-3">Version 2.25.1</p>
        </div>

        {/* Logout Button */}
        <div className="px-5 pb-6">
          <Button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
          >
            <LogOut size={18} className="mr-2" />
            Log out
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SettingsScreenNew;
