import { useEffect, useState } from 'react';
import '@/App.css';
import '@/styles/whatsapp-theme.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthScreen from './pages/AuthScreen';
import ChatListScreen from './pages/ChatListScreen';
import ChatScreen from './pages/ChatScreen';
import SettingsScreen from './pages/SettingsScreenNew';
import StatusScreen from './pages/StatusScreen';
import CallScreen from './pages/CallScreen';
import GroupsScreen from './pages/GroupsScreen';
import CallsScreen from './pages/CallsScreen';
import DesktopLayout from './components/Layout/DesktopLayout';
import MobileLayout from './components/Layout/MobileLayout';
import IOSBottomNav from './components/Navigation/IOSBottomNav';
import IOSHeader from './components/Navigation/IOSHeader';
import AndroidBottomNav from './components/Navigation/AndroidBottomNav';
import AndroidHeader from './components/Navigation/AndroidHeader';
import DesktopSidebar from './components/Navigation/DesktopSidebar';
import InstallPrompt from './components/PWA/InstallPrompt';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { user, loading } = useAuth();
  const { type, platform } = useDevice();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#00A884]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">WA</p>
        </div>
      </div>
    );
  }

  // Desktop layout with new sidebar
  if (type === 'desktop') {
    return (
      <Routes>
        <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
        <Route
          path="/*"
          element={
            user ? (
              <div className="flex h-screen bg-[#111B21]">
                {/* Left Navigation Sidebar */}
                <div className="w-[72px] border-r border-[#2A3942] flex flex-col">
                  <DesktopSidebar />
                </div>
                
                {/* Middle Section - Chat List or Other Screens */}
                <div className="w-[400px] border-r border-[#2A3942] flex flex-col">
                  <Routes>
                    <Route path="/" element={<ChatListScreen />} />
                    <Route path="/chat/:chatId" element={<ChatListScreen />} />
                    <Route path="/calls" element={<CallsScreen />} />
                    <Route path="/status" element={<StatusScreen />} />
                    <Route path="/settings" element={<SettingsScreen />} />
                    <Route path="/groups" element={<GroupsScreen />} />
                  </Routes>
                </div>
                
                {/* Right Section - Chat Window */}
                <div className="flex-1 flex flex-col">
                  <Routes>
                    <Route path="/" element={
                      <div className="flex items-center justify-center h-full bg-[#222E35]">
                        <div className="text-center">
                          <MessageCircle size={120} className="text-[#54656F] mx-auto mb-6" />
                          <h2 className="text-[#E9EDEF] text-3xl font-light mb-2">WA for Desktop</h2>
                          <p className="text-[#8696A0] text-sm">Select a chat to start messaging</p>
                        </div>
                      </div>
                    } />
                    <Route path="/chat/:chatId" element={<ChatScreen />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      </Routes>
    );
  }

  // Mobile layout (iOS/Android) with new bottom navigation
  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          user ? (
            <div className="h-screen flex flex-col bg-[#111B21]">
              {platform === 'android' && <AndroidHeader />}
              <div className="flex-1 overflow-hidden">
                <ChatListScreen />
              </div>
              {platform === 'android' && <AndroidBottomNav />}
              {platform === 'ios' && <IOSBottomNav />}
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/chat/:chatId"
        element={
          user ? (
            <div className="h-screen flex flex-col bg-[#111B21]">
              <div className="flex-1 overflow-hidden">
                <ChatScreen />
              </div>
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/status"
        element={
          user ? (
            <div className="h-screen flex flex-col bg-[#111B21]">
              {platform === 'android' && <AndroidHeader title="Status" />}
              <div className="flex-1 overflow-hidden">
                <StatusScreen />
              </div>
              {platform === 'android' && <AndroidBottomNav />}
              {platform === 'ios' && <IOSBottomNav />}
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          user ? (
            <div className="h-screen flex flex-col bg-[#111B21]">
              {platform === 'android' && <AndroidHeader title="Settings" />}
              <div className="flex-1 overflow-hidden">
                <SettingsScreen />
              </div>
              {platform === 'android' && <AndroidBottomNav />}
              {platform === 'ios' && <IOSBottomNav />}
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/groups"
        element={
          user ? (
            <div className="h-screen flex flex-col bg-[#111B21]">
              {platform === 'android' && <AndroidHeader title="Groups" />}
              <div className="flex-1 overflow-hidden">
                <GroupsScreen />
              </div>
              {platform === 'android' && <AndroidBottomNav />}
              {platform === 'ios' && <IOSBottomNav />}
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/calls"
        element={
          user ? (
            <div className="h-screen flex flex-col bg-[#111B21]">
              {platform === 'android' && <AndroidHeader title="Calls" />}
              <div className="flex-1 overflow-hidden">
                <CallsScreen />
              </div>
              {platform === 'android' && <AndroidBottomNav />}
              {platform === 'ios' && <IOSBottomNav />}
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/call/:callId"
        element={user ? <CallScreen /> : <Navigate to="/auth" />}
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('SW registered:', registration))
          .catch(error => console.log('SW registration failed:', error));
      });
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <DeviceProvider>
          <AuthProvider>
            <SocketProvider>
              <InstallPrompt />
              <AppContent />
              <Toaster position="top-center" richColors />
            </SocketProvider>
          </AuthProvider>
        </DeviceProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
