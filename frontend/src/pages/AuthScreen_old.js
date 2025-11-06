import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { generateKeyPair } from '../utils/encryption';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input'); // 'input' or 'verify'
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('phone');
  const { requestOTP, verifyOTP } = useAuth();
  const { platform, type } = useDevice();

  const handleRequestOTP = async () => {
    if (!phoneNumber && !email) {
      toast.error('Please enter phone number or email');
      return;
    }

    setLoading(true);
    try {
      const response = await requestOTP(
        authMethod === 'phone' ? phoneNumber : null,
        authMethod === 'email' ? email : null
      );
      toast.success(`OTP sent! (Test OTP: ${response.otp})`);
      setStep('verify');
    } catch (error) {
      toast.error('Failed to send OTP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Generate encryption keys
      const keyPair = await generateKeyPair();
      localStorage.setItem('wa_private_key', keyPair.privateKey);

      await verifyOTP(
        authMethod === 'phone' ? phoneNumber : null,
        authMethod === 'email' ? email : null,
        otp,
        `${platform.toUpperCase()} - ${navigator.userAgent.split(')')[0].split('(')[1] || 'Browser'}`,
        platform,
        keyPair.publicKey
      );
      toast.success('Welcome to WA!');
    } catch (error) {
      toast.error('Invalid OTP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            WA
          </h1>
          <p className="text-gray-600">Simple. Secure. Reliable messaging.</p>
        </div>

        <Card className="shadow-xl border-0 slide-in" data-testid="auth-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              {step === 'input' ? 'Enter your details to get started' : 'Enter the OTP sent to you'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'input' ? (
              <Tabs defaultValue="phone" className="w-full" onValueChange={setAuthMethod}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="phone" data-testid="phone-tab">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </TabsTrigger>
                  <TabsTrigger value="email" data-testid="email-tab">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full"
                      data-testid="phone-input"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      data-testid="email-input"
                    />
                  </div>
                </TabsContent>

                <Button
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="request-otp-button"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Enter OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-widest"
                    data-testid="otp-input"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Sent to {authMethod === 'phone' ? phoneNumber : email}
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="verify-otp-button"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep('input')}
                  className="w-full"
                  data-testid="back-button"
                >
                  Go Back
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>By continuing, you agree to WA's Terms of Service and Privacy Policy</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>End-to-end encrypted messaging</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
