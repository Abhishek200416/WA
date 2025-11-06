import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MessageCircle, Phone, Mail, User, Info } from 'lucide-react';
import WALogo from '../components/Branding/WALogo';

const AuthScreen = () => {
  const [step, setStep] = useState('welcome'); // welcome, input, otp, profile
  const [authType, setAuthType] = useState('phone'); // phone or email
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    about: 'Hey there! I am using WA',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const { verifyOTP, updateUser } = useAuth();

  const handleRequestOTP = async () => {
    if (!phoneOrEmail) {
      toast.error('Please enter your ' + (authType === 'phone' ? 'phone number' : 'email'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [authType === 'phone' ? 'phone_number' : 'email']: phoneOrEmail
        })
      });

      if (response.ok) {
        toast.success('OTP sent! Use 123456 for testing');
        setStep('otp');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [authType === 'phone' ? 'phone_number' : 'email']: phoneOrEmail,
          otp: otp,
          device_name: 'Web Browser',
          device_type: 'web',
          public_key: 'demo_public_key_' + Date.now()
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.is_new_user) {
          toast.success('Verified! Please complete your profile');
          setStep('profile');
        } else {
          // Store user and device data
          localStorage.setItem('wa_user', JSON.stringify(data.user));
          localStorage.setItem('wa_device', JSON.stringify(data.device));
          localStorage.setItem('wa_token', data.token || '');
          toast.success('Welcome back!');
          window.location.reload(); // Reload to update auth context
        }
      } else {
        toast.error(data.detail || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!profileData.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [authType === 'phone' ? 'phone_number' : 'email']: phoneOrEmail,
          otp: otp,
          device_name: 'Web Browser',
          device_type: 'web',
          public_key: 'demo_public_key_' + Date.now(),
          name: profileData.name,
          username: profileData.username,
          about: profileData.about
        })
      });

      const data = await response.json();
      if (response.ok) {
        login(data.user);
        toast.success('Profile created! Welcome to WA');
      } else {
        toast.error(data.detail || 'Failed to create profile');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00A884] to-[#128C7E] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <WALogo size="xl" showText={false} />
            </div>
            <CardTitle className="text-3xl font-bold text-[#111B21]">Welcome to WA</CardTitle>
            <CardDescription className="text-base">
              Connect with friends and family instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12 text-lg"
              onClick={() => setStep('input')}
            >
              Get Started
            </Button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phone/Email Input
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00A884] to-[#128C7E] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WALogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold">Sign in to WA</CardTitle>
            <CardDescription>
              Enter your phone number or email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phone" className="w-full" onValueChange={setAuthType}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="h-12"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12 mt-6"
              onClick={handleRequestOTP}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setStep('welcome')}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // OTP Verification
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00A884] to-[#128C7E] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WALogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {phoneOrEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 text-center text-2xl tracking-widest"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-blue-700">For testing, use OTP: <strong>123456</strong></p>
            </div>

            <Button 
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12"
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={handleRequestOTP}
              disabled={loading}
            >
              Resend OTP
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile Setup
  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00A884] to-[#128C7E] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WALogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              Let others know who you are
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="bg-[#25D366] text-white text-3xl">
                  <User size={48} />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                placeholder="@username"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Input
                id="about"
                placeholder="Hey there! I am using WA"
                value={profileData.about}
                onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                className="h-11"
              />
            </div>

            <Button 
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12"
              onClick={handleCompleteProfile}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Complete Setup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthScreen;
