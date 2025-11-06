import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem('wa_user');
    const storedDevice = localStorage.getItem('wa_device');
    
    if (storedUser && storedDevice) {
      setUser(JSON.parse(storedUser));
      setDevice(JSON.parse(storedDevice));
    }
    setLoading(false);
  }, []);

  const requestOTP = async (phoneNumber, email) => {
    try {
      const response = await axios.post(`${API}/auth/request-otp`, {
        phone_number: phoneNumber,
        email: email
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber, email, otp, deviceName, deviceType, publicKey) => {
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        phone_number: phoneNumber,
        email: email,
        otp: otp,
        device_name: deviceName,
        device_type: deviceType,
        public_key: publicKey
      });
      
      const { user: userData, device: deviceData } = response.data;
      
      setUser(userData);
      setDevice(deviceData);
      
      localStorage.setItem('wa_user', JSON.stringify(userData));
      localStorage.setItem('wa_device', JSON.stringify(deviceData));
      localStorage.setItem('wa_token', response.data.token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setDevice(null);
    localStorage.removeItem('wa_user');
    localStorage.removeItem('wa_device');
    localStorage.removeItem('wa_token');
  };

  const updateUser = async (updates) => {
    try {
      const response = await axios.patch(`${API}/users/me?user_id=${user.id}`, updates);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('wa_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, device, loading, requestOTP, verifyOTP, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
