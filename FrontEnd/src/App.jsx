import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './signup';
import Dashboard from './dashboard';
import LandingPage from './LandingPage';
import Complaints from './complaints';
import Mess from './mess';
import NotFound from './NotFound';
import './App.css';
import Leave from './Leave';
import Community from './Community';
import Profile from './Profile';
import ProtectedRoute from './ProtectedRoute'; 
import YourPosts from './yourposts';

import A_Dashboard from './Admin/dashboard';
import A_Complaints from './Admin/complaints';
import A_Mess from './Admin/mess';
import A_Community from './Admin/community';
import A_Leave from './Admin/leave';
import A_Profile from './Admin/profile';
import A_YourPosts from './Admin/yourposts';
import Admin from './Admin/Admin';

import PublicProfile from './PublicProfile';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route index element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/mess" element={<ProtectedRoute><Mess /></ProtectedRoute>} />
        <Route path="/dashboard/Community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/dashboard/Community/yourposts" element={<ProtectedRoute><YourPosts /></ProtectedRoute>} />
        <Route path="/dashboard/Complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="/dashboard/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard/Leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><A_Dashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard/mess" element={<ProtectedRoute><A_Mess /></ProtectedRoute>} />
        <Route path="/admin/dashboard/Community" element={<ProtectedRoute><A_Community /></ProtectedRoute>} />
        <Route path="/admin/dashboard/Community/yourposts" element={<ProtectedRoute><A_YourPosts /></ProtectedRoute>} />
        <Route path="/admin/dashboard/Complaints" element={<ProtectedRoute><A_Complaints /></ProtectedRoute>} />
        <Route path="/admin/dashboard/Profile" element={<ProtectedRoute><A_Profile /></ProtectedRoute>} />
        <Route path="/admin/dashboard/Leave" element={<ProtectedRoute><A_Leave /></ProtectedRoute>} />

        {/* Public routes */}

        <Route path="/user/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
