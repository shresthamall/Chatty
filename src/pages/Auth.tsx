import React, { useState } from 'react';
import { 
  useSignUpEmailPassword, 
  useSignInEmailPassword, 
  useAuthenticationStatus 
} from '@nhost/react';
import { Navigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the current authentication state
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthenticationStatus();
  
  // Initialize the auth hooks
  const { signUpEmailPassword } = useSignUpEmailPassword();
  const { signInEmailPassword } = useSignInEmailPassword();
  
  // Log auth state changes for debugging
  console.log('Rendering Auth component, isAuthenticated:', isAuthenticated, 'isLoading:', isAuthLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error, needsEmailVerification } = await signUpEmailPassword(email, password);
        if (error) {
          setAuthError(error.message);
        } else if (needsEmailVerification) {
          setAuthError('Please check your email to verify your account before signing in.');
        }
      } else {
        const { error } = await signInEmailPassword(email, password);
        if (error) {
          setAuthError(error.message);
        }
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated && !isAuthLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: isLoading ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      {authError && (
        <p style={{ color: 'red' }}>{authError}</p>
      )}
      <button onClick={() => setIsSignUp(!isSignUp)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
        {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
      </button>
    </div>
  );
};

export default Auth;

