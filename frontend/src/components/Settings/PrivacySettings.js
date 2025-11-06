import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff, Phone, Image, Info } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrivacySettings = () => {
  const { user, setUser } = useAuth();
  const [privacy, setPrivacy] = useState({
    profile_photo: 'everyone',
    about: 'everyone',
    last_seen: 'everyone',
    status: 'contacts',
    read_receipts: true,
    online_status: true,
    phone_number: 'everyone'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.privacy_settings) {
      setPrivacy({ ...privacy, ...user.privacy_settings });
    }
  }, [user]);

  const updatePrivacy = async (field, value) => {
    setLoading(true);
    try {
      const newPrivacy = { ...privacy, [field]: value };
      setPrivacy(newPrivacy);

      await axios.patch(`${API}/users/me?user_id=${user.id}`, {
        privacy_settings: newPrivacy
      });

      // Update local user state
      setUser({ ...user, privacy_settings: newPrivacy });
      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Failed to update privacy:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const PrivacyOption = ({ icon: Icon, title, description, field, options }) => (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#00A884]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#00A884]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">{description}</p>
          {options ? (
            <Select
              value={privacy[field]}
              onValueChange={(value) => updatePrivacy(field, value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Switch
              checked={privacy[field]}
              onCheckedChange={(checked) => updatePrivacy(field, checked)}
              disabled={loading}
            />
          )}
        </div>
      </div>
    </div>
  );

  const visibilityOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'My Contacts' },
    { value: 'nobody', label: 'Nobody' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
          <p className="text-sm text-gray-500 mt-1">
            Control who can see your information and how people can reach you
          </p>
        </div>

        <div className="p-6">
          <PrivacyOption
            icon={Eye}
            title="Last Seen & Online"
            description="Control who can see when you were last online"
            field="last_seen"
            options={visibilityOptions}
          />

          <PrivacyOption
            icon={Image}
            title="Profile Photo"
            description="Choose who can see your profile photo"
            field="profile_photo"
            options={visibilityOptions}
          />

          <PrivacyOption
            icon={Info}
            title="About"
            description="Control who can see your about/status message"
            field="about"
            options={visibilityOptions}
          />

          <PrivacyOption
            icon={Phone}
            title="Phone Number"
            description="Choose who can see your phone number. When hidden, only your display name will be shown."
            field="phone_number"
            options={visibilityOptions}
          />

          <div className="py-4 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00A884]/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-[#00A884]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Read Receipts</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      If turned off, you won't send or receive read receipts
                    </p>
                  </div>
                  <Switch
                    checked={privacy.read_receipts}
                    onCheckedChange={(checked) => updatePrivacy('read_receipts', checked)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00A884]/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-[#00A884]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Online Status</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Show when you're online
                    </p>
                  </div>
                  <Switch
                    checked={privacy.online_status}
                    onCheckedChange={(checked) => updatePrivacy('online_status', checked)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Privacy & Security</p>
            <p>
              WA respects your privacy. Your personal information is encrypted and only visible based on your settings above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
