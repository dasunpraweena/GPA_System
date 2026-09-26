import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './views/components/Navbar.jsx';
import { AuthPage } from './views/pages/AuthPage.jsx';
import { StudentDashboard } from './views/pages/StudentDashboard.jsx';
import { AdminDashboard } from './views/pages/AdminDashboard.jsx';
import { authApi } from './services/apiClient.js';

const AppContent = () => {
  const { user, loading, checkAuth } = useAuth();
  const [initialAuthScreen, setInitialAuthScreen] = useState('login');
  const [verificationFeedback, setVerificationFeedback] = useState(null);

  // Check URL query parameters for email verification or password reset links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authAction = params.get('auth');
    const token = params.get('token');
    const email = params.get('email');

    if (authAction === 'verify-token' && token) {
      authApi.verifyEmail(token, email)
        .then(() => {
          setInitialAuthScreen('verified');
          checkAuth();
        })
        .catch((err) => {
          setVerificationFeedback(err.message || 'Verification link expired or invalid.');
          setInitialAuthScreen('verify');
        });
    } else if (authAction === 'reset' && token) {
      setInitialAuthScreen('reset');
    }
  }, [checkAuth]);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#1b4338', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brandmark" style={{ margin: '0 auto 16px' }}>Σ</div>
          <p style={{ fontSize: '15px', color: '#63736e' }}>Loading Semester GPA System...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication Page
  if (!user) {
    return (
      <div>
        <Navbar />
        {verificationFeedback && (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 20px' }}>
            <div className="auth-error">{verificationFeedback}</div>
          </div>
        )}
        <AuthPage initialScreen={initialAuthScreen} />
      </div>
    );
  }

  // Logged in as Administrator
  if (user.role === 'admin') {
    return (
      <div>
        <Navbar />
        <AdminDashboard />
      </div>
    );
  }

  // Logged in as Student
  return (
    <div>
      <Navbar />
      <StudentDashboard />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
