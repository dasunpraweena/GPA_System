import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/apiClient.js';

export const useAuthViewModel = (initialScreen = 'login') => {
  const { login: contextLogin, user } = useAuth();

  const [screen, setScreen] = useState(initialScreen);
  const [authEmail, setAuthEmail] = useState('22cse0373@ms.sab.ac.lk');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Resend cooldown timer
  const [resendSeconds, setResendSeconds] = useState(0);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const switchScreen = (newScreen) => {
    clearTimer();
    setError('');
    setFeedback('');
    setScreen(newScreen);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setFeedback('');

    if (!/^[^\s@]+@ms\.sab\.ac\.lk$/i.test(authEmail.trim())) {
      setError('Please use a university email ending in @ms.sab.ac.lk.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.register({
        fullName,
        email: authEmail.trim(),
        password,
        confirmPassword
      });
      if (res?.verifyUrl) {
        setPreviewUrl(res.verifyUrl);
      }
      switchScreen('verify');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!/^[^\s@]+@ms\.sab\.ac\.lk$/i.test(authEmail.trim())) {
      setError('Please use a university email ending in @ms.sab.ac.lk.');
      return;
    }

    setIsSubmitting(true);
    try {
      await contextLogin(authEmail.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0) return;
    setError('');
    setFeedback('');

    try {
      const res = await authApi.resendVerification(authEmail.trim());
      if (res?.verifyUrl) {
        setPreviewUrl(res.verifyUrl);
      }
      setFeedback('A new verification email has been dispatched.');

      let sec = 30;
      setResendSeconds(sec);
      timerRef.current = setInterval(() => {
        sec -= 1;
        setResendSeconds(sec);
        if (sec <= 0) {
          clearTimer();
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Could not resend verification email.');
    }
  };

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setFeedback('');

    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(authEmail.trim());
      if (res?.resetUrl) {
        setPreviewUrl(res.resetUrl);
      }
      setFeedback('If an account exists for this email, you will receive a password reset link.');
    } catch (err) {
      setError(err.message || 'Failed to request reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (token, e) => {
    if (e) e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: password,
        confirmPassword
      });
      switchScreen('resetdone');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    screen,
    authEmail,
    setAuthEmail,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    feedback,
    isSubmitting,
    resendSeconds,
    previewUrl,
    switchScreen,
    handleRegister,
    handleLogin,
    handleResend,
    handleForgotPassword,
    handleResetPassword,
    user
  };
};
