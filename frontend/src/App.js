import { useEffect, useState } from 'react';
import '@/App.css';
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
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={user ? <ChatListScreen /> : <Navigate to="/auth" />}
      />
      <Route
        path="/chat/:chatId"
        element={user ? <ChatScreen /> : <Navigate to="/auth" />}
      />
      <Route
        path="/status"
        element={user ? <StatusScreen /> : <Navigate to="/auth" />}
      />
      <Route
        path="/settings"
        element={user ? <SettingsScreen /> : <Navigate to="/auth" />}
      />
      <Route
        path="/call/:callId"
        element={user ? <CallScreen /> : <Navigate to="/auth" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <DeviceProvider>
          <AuthProvider>
            <SocketProvider>
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
