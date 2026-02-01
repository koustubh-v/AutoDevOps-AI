
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { Icons } from '../constants';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemoCredentials = () => {
    setEmail('koustubh.rvce@gmail.com');
    setPassword('koust123');
    setIsSignUp(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-[#9aa0a6] hover:text-white transition-colors group"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back
      </button>

      <div className="w-full max-w-[448px]">
        <div className="bg-[#1e1f20] border border-[#3c4043] rounded-[28px] p-10 md:p-12 shadow-2xl overflow-hidden relative">
          {/* Decorative subtle gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8ab4f8]/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex flex-col items-center mb-8">
            <div className="text-[#8ab4f8] mb-4 scale-150">
              <Icons.Cpu />
            </div>
            <h2 className="text-2xl font-google font-bold text-white text-center">
              {isSignUp ? 'Create your account' : 'Sign in to AutoDevOps'}
            </h2>
            <p className="text-[#9aa0a6] text-sm mt-2 text-center">
              Experience the future of autonomous engineering.
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-white placeholder:text-[#5f6368] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none transition-all"
                />
              </div>
            )}
            <div className="relative group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-white placeholder:text-[#5f6368] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none transition-all"
              />
            </div>
            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#131314] border border-[#3c4043] rounded-xl px-4 py-3 text-white placeholder:text-[#5f6368] focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] outline-none transition-all"
              />
            </div>

            {error && (
              <div className="text-[#f28b82] text-xs font-medium px-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#8ab4f8] hover:bg-[#a6c1ee] disabled:bg-[#3c4043] text-[#131314] rounded-xl font-bold transition-all mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#131314] border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                isSignUp ? 'Sign up' : 'Continue'
              )}
            </button>
          </form>

          {/* Minimalist Demo Account Button */}
          <div className="mt-6 flex justify-center">
            <button 
              onClick={fillDemoCredentials}
              className="px-6 py-2 border border-[#3c4043] text-[#8ab4f8] hover:bg-[#3c4043]/30 rounded-full text-sm font-medium transition-colors"
            >
              Use Demo Account
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3c4043]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e1f20] px-3 text-[#9aa0a6] font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-[#f8f9fa] text-[#3c4043] rounded-xl font-medium border border-[#dadce0] transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M0 0h24v24H0V0z" fill="none"/>
            </svg>
            Google
          </button>

          <p className="mt-8 text-center text-sm text-[#9aa0a6]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#8ab4f8] font-medium hover:underline transition-all"
            >
              {isSignUp ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </div>
        
        <p className="mt-6 text-center text-[11px] text-[#5f6368] uppercase tracking-[2px] font-bold">
          Protected by Google Cloud Security
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
