import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Phone, Check, Loader2, Mail, User } from 'lucide-react';
import axios from 'axios';
import WALogo from '@/components/Branding/WALogo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthScreen = () => {
  const [step, setStep] = useState('welcome'); // welcome, phone, otp, profile
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [authMethod, setAuthMethod] = useState('phone'); // phone or email
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async () => {
    if (authMethod === 'phone' && !phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (authMethod === 'email' && !email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const data = authMethod === 'phone' 
        ? { phone_number: phoneNumber }
        : { email: email };
      
      const response = await axios.post(`${API}/auth/request-otp`, data);
      
      toast.success('OTP sent successfully! (Use 123456 for testing)');
      setStep('otp');
      setCountdown(60);
    } catch (error) {
      console.error('Failed to request OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const verifyData = {
        otp: otp,
        device_name: navigator.userAgent,
        device_type: 'web',
        public_key: `pub_${Date.now()}`
      };

      if (authMethod === 'phone') {
        verifyData.phone_number = phoneNumber;
      } else {
        verifyData.email = email;
      }

      const response = await axios.post(`${API}/auth/verify-otp`, verifyData);
      
      if (response.data.user && !response.data.user.display_name) {
        // New user, need to set up profile
        setStep('profile');
      } else {
        // Existing user, login
        login(response.data.user, response.data.token);
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd update the user profile here
      // For now, we'll just navigate to the app
      toast.success('Profile setup complete! Welcome to WA!');
      navigate('/');
    } catch (error) {
      console.error('Failed to complete profile:', error);
      toast.error('Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E5DDD5] to-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <WALogo size={120} showText={true} />
          </div>

          {/* Welcome Card */}
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-normal">Welcome to WA</CardTitle>
              <CardDescription className="text-base mt-2">
                Secure messaging for everyone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 text-center space-y-2 py-4">
                <p>Read our Privacy Policy. Tap "Agree and continue" to accept the Terms of Service.</p>
              </div>
              
              <Button
                onClick={() => setStep('phone')}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white h-12 text-base"
              >
                Agree and Continue
              </Button>

              <div className="text-xs text-center text-gray-500 pt-4">
                <p>from</p>
                <p className="font-semibold text-gray-700 mt-1">EMERGENT</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Phone/Email Input Screen
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E5DDD5] to-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-normal">Verify your number</CardTitle>
              <CardDescription className="mt-4">
                WA will send an SMS message (carrier charges may apply) to verify your phone number. Or use email instead.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auth Method Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                    authMethod === 'phone' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Phone</span>
                </button>
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                    authMethod === 'email' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Email</span>
                </button>
              </div>

              {/* Input */}
              {authMethod === 'phone' ? (
                <div>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 h-12 text-base"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You must verify that this phone number belongs to you.
                  </p>
                </div>
              ) : (
                <div>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a verification code to this email address.
                  </p>
                </div>
              )}

              <Button
                onClick={handleRequestOTP}
                disabled={loading || (authMethod === 'phone' ? !phoneNumber.trim() : !email.trim())}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Next'
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep('welcome')}
                className="w-full"
                disabled={loading}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // OTP Verification Screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E5DDD5] to-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-normal">Enter verification code</CardTitle>
              <CardDescription className="mt-4">
                {authMethod === 'phone' 
                  ? `We sent a code to ${phoneNumber}` 
                  : `We sent a code to ${email}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Input */}
              <div>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-center text-gray-500 mt-3">
                  {countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    <button 
                      onClick={handleRequestOTP}
                      className="text-[#00A884] font-medium hover:underline"
                      disabled={loading}
                    >
                      Resend code
                    </button>
                  )}
                </p>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full"
                disabled={loading}
              >
                Change number
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 text-center">
                  🔐 For testing, use OTP: <span className="font-mono font-bold">123456</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profile Setup Screen (for new users)
  if (step === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E5DDD5] to-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-normal">Profile info</CardTitle>
              <CardDescription className="mt-4">
                Please provide your name and an optional profile photo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Placeholder */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-[#DFE5E7] flex items-center justify-center cursor-pointer hover:bg-[#D1D7DB] transition-colors">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              </div>

              {/* Name Input */}
              <div>
                <Input
                  type="text"
                  placeholder="Type your name here"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12 text-base"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  This name will be visible to your WA contacts
                </p>
              </div>

              <Button
                onClick={handleCompleteProfile}
                disabled={loading || !displayName.trim()}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthScreen;
