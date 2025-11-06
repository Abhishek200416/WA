import { useEffect, useState } from 'react';
import '@/App.css';
import '@/styles/whatsapp-theme.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthScreen from './pages/AuthScreen';
import ChatListScreen from './pages/ChatListScreen';
import ChatScreen from './pages/ChatScreen';
import SettingsScreen from './pages/SettingsScreen';
import StatusScreen from './pages/StatusScreen';
import CallScreen from './pages/CallScreen';
import GroupsScreen from './pages/GroupsScreen';
import CallsScreen from './pages/CallsScreen';
import DesktopLayout from './components/Layout/DesktopLayout';
import MobileLayout from './components/Layout/MobileLayout';
import IOSNavBar from './components/Navigation/IOSNavBar';
import AndroidTopBar from './components/Navigation/AndroidTopBar';
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

  // Desktop layout
  if (type === 'desktop') {
    return (
      <Routes>
        <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
        <Route
          path="/*"
          element={
            user ? (
              <DesktopLayout>
                <ChatListScreen />
              </DesktopLayout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        >
          <Route path="chat/:chatId" element={<ChatScreen />} />
        </Route>
      </Routes>
    );
  }

  // Mobile layout (iOS/Android)
  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={
          user ? (
            <MobileLayout platform={platform}>
              {platform === 'android' && <AndroidTopBar />}
              <ChatListScreen />
              {platform === 'ios' && <IOSNavBar />}
            </MobileLayout>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/chat/:chatId"
        element={
          user ? (
            <MobileLayout platform={platform}>
              <ChatScreen />
            </MobileLayout>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/status"
        element={
          user ? (
            <MobileLayout platform={platform}>
              {platform === 'android' && <AndroidTopBar title="Status" />}
              <StatusScreen />
              {platform === 'ios' && <IOSNavBar />}
            </MobileLayout>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          user ? (
            <MobileLayout platform={platform}>
              {platform === 'android' && <AndroidTopBar title="Settings" />}
              <SettingsScreen />
              {platform === 'ios' && <IOSNavBar />}
            </MobileLayout>
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
