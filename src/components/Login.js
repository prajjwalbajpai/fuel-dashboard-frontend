import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      // onLoginSuccess will be called after redirect in App.js
    } catch (error) {
      setError(error.error_description || error.message);
      console.error('Error during Google sign-in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚗 Vehicle Dashboard</h1>
        <p>Sign in to track your vehicle's performance</p>
        {error && <div className="error-message">{error}</div>}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="google-signin-btn"
        >
          {loading ? (
            <>
              <div className="spinner-small"></div>
              Signing in...
            </>
          ) : (
            <>
              <img
                src={require('../google.png')}
                alt="Google Icon"
                style={{ width: '24px', height: '24px', marginRight: '10px' }}
              />
              Sign in with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
