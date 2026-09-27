import React from 'react';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel.js';

export const AuthPage = ({ initialScreen = 'login', onVerifiedSuccess }) => {
  const {
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
    handleResetPassword
  } = useAuthViewModel(initialScreen);

  return (
    <section className="auth-shell" aria-label="Account access">
      {/* Left Artwork Column */}
      <div className="auth-art">
        <div>
          <div className="eyebrow">SOFTWARE ENGINEERING · SUSL</div>
          <h2>
            A clearer view
            <br />
            of your degree.
          </h2>
          <p>
            All your grades. Every semester.
            <br />
            One place to see your progress.
          </p>
        </div>

        <div className="preview-card">
          <div className="eyebrow">ILLUSTRATIVE GPA</div>
          <div className="preview-value">
            3.72 <span style={{ fontSize: '16px', color: '#b9d2c3' }}>/ 4.00</span>
          </div>
          <p style={{ fontSize: '13px' }}>Eight semesters. Four years of progress.</p>
          <div className="preview-track">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <small>For students with an @ms.sab.ac.lk university email.</small>
      </div>

      {/* Right Content Column */}
      <div className="auth-content">
        {screen === 'register' && (
          <div>
            <div className="eyebrow">START YOUR JOURNEY</div>
            <h2>Create your account</h2>
            <p className="subtitle">Track your results throughout your degree.</p>

            <form onSubmit={handleRegister}>
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <label htmlFor="reg-email">University email</label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                placeholder="22cse0373@ms.sab.ac.lk"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <p className="helper">Use your @ms.sab.ac.lk email address.</p>

              <label htmlFor="reg-password">Password</label>
              <div className="passwordbox">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="helper">Use at least 8 characters. A memorable passphrase works well.</p>

              <label htmlFor="reg-confirm">Confirm password</label>
              <div className="passwordbox">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  maxLength={128}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}

              <button className="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="auth-bottom">
              Already registered?{' '}
              <button className="auth-link" type="button" onClick={() => switchScreen('login')}>
                Log in
              </button>
            </div>
          </div>
        )}

        {screen === 'login' && (
          <div>
            <div className="eyebrow">WELCOME BACK</div>
            <h2>Log in to Semester</h2>
            <p className="subtitle">Pick up where you left off.</p>

            <form onSubmit={handleLogin}>
              <label htmlFor="login-email">University email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="22cse0373@ms.sab.ac.lk"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <p className="helper">Use your @ms.sab.ac.lk email address.</p>

              <label htmlFor="login-password">Password</label>
              <div className="passwordbox">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="auth-split">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => switchScreen('forgot')}
                >
                  Forgot password?
                </button>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}

              <button className="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="auth-bottom">
              New here?{' '}
              <button className="auth-link" type="button" onClick={() => switchScreen('register')}>
                Create an account
              </button>
            </div>
          </div>
        )}

        {screen === 'verify' && (
          <div>
            <div className="auth-icon" aria-hidden="true">✉</div>
            <h2>Check your email</h2>
            <p className="subtitle">
              Open the verification link sent to
              <br />
              <span className="email-display">{authEmail}</span>
            </p>

            <div className="auth-info">
              Check your spam folder if you cannot find the message. Verify your email before logging in.
            </div>

            {previewUrl && (
              <a
                href={previewUrl}
                className="primary"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '14px' }}
              >
                Click to Verify Email & Continue
              </a>
            )}

            <button
              type="button"
              className="primary"
              onClick={() => switchScreen('login')}
            >
              Continue to Login
            </button>

            <div className="auth-bottom">
              Didn't receive it?{' '}
              <button
                type="button"
                className="auth-link"
                disabled={resendSeconds > 0}
                onClick={handleResend}
              >
                {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend email'}
              </button>
            </div>

            {feedback && <div className="auth-feedback" role="status">{feedback}</div>}
            {error && <div className="auth-error" role="alert">{error}</div>}

            <div className="auth-bottom" style={{ marginTop: '16px' }}>
              <button className="auth-link" type="button" onClick={() => switchScreen('register')}>
                Change email address
              </button>{' '}
              ·{' '}
              <button className="auth-link" type="button" onClick={() => switchScreen('login')}>
                Back to login
              </button>
            </div>
          </div>
        )}

        {screen === 'verified' && (
          <div>
            <div className="auth-icon" aria-hidden="true">✓</div>
            <h2>Email verified</h2>
            <p className="subtitle">
              Your university email is confirmed. You're ready to start tracking your results.
            </p>
            <div className="auth-info email-display">{authEmail}</div>
            <button className="primary" type="button" onClick={() => switchScreen('login')}>
              Continue to login
            </button>
          </div>
        )}

        {screen === 'forgot' && (
          <div>
            <div className="auth-icon" aria-hidden="true">↺</div>
            <h2>Forgot your password?</h2>
            <p className="subtitle">Enter your university email to request a reset link.</p>

            <form onSubmit={handleForgotPassword}>
              <label htmlFor="forgot-email">University email</label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                placeholder="22cse0373@ms.sab.ac.lk"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />

              {error && <div className="auth-error" role="alert">{error}</div>}

              <button className="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            {feedback && (
              <div style={{ marginTop: '20px' }}>
                <div className="auth-info" role="status">{feedback}</div>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="auth-link"
                    style={{ display: 'inline-block', marginTop: '10px' }}
                  >
                    Open Reset Link
                  </a>
                )}
              </div>
            )}

            <div className="auth-bottom">
              <button className="auth-link" type="button" onClick={() => switchScreen('login')}>
                Back to login
              </button>
            </div>
          </div>
        )}

        {screen === 'reset' && (
          <div>
            <div className="eyebrow">ACCOUNT RECOVERY</div>
            <h2>Set a new password</h2>
            <p className="subtitle">Choose a password you haven't used before.</p>

            <form onSubmit={(e) => handleResetPassword(new URLSearchParams(window.location.search).get('token'), e)}>
              <label htmlFor="reset-pass">New password</label>
              <div className="passwordbox">
                <input
                  id="reset-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <label htmlFor="reset-confirm">Confirm new password</label>
              <div className="passwordbox">
                <input
                  id="reset-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  maxLength={128}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {error && <div className="auth-error" role="alert">{error}</div>}

              <button className="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Reset password'}
              </button>
            </form>

            <div className="auth-bottom">
              <button className="auth-link" type="button" onClick={() => switchScreen('login')}>
                Back to login
              </button>
            </div>
          </div>
        )}

        {screen === 'resetdone' && (
          <div>
            <div className="auth-icon" aria-hidden="true">✓</div>
            <h2>Password updated</h2>
            <p className="subtitle">You can now log in with your new password.</p>
            <button className="primary" type="button" onClick={() => switchScreen('login')}>
              Back to login
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
