import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import { logIn } from '../firebase/auth';
import firebase from 'firebase/compat/app';

interface LoginScreenProps {
  onGoToSignup: () => void;
  onSkip: () => void;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${className}`} {...props} />
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onGoToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await logIn(email, password);
      // onAuthStateChanged in App.tsx will handle navigation
    } catch (err) {
      // Fix: Use firebase.FirebaseError from the compat library.
      if (err instanceof firebase.FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Invalid email or password.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
            break;
        }
      } else {
        setError('An unexpected error occurred.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-purple-50 to-purple-200 flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="w-full max-w-sm flex flex-col justify-center flex-1">
        <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold">JengaV</h1>
        </div>

        <div className="mb-8">
            <h2 className="text-4xl font-bold text-black">Log In</h2>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-800">Email</Label>
            <Input type="email" id="email" placeholder="email@domain.com" className="mt-1" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-800">Password</Label>
            <Input type="password" id="password" className="mt-1" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div className="pt-4 space-y-4">
            <Button type="submit" className="w-full bg-black text-white rounded-lg h-12 text-base font-semibold hover:bg-gray-800 focus-visible:ring-black disabled:bg-gray-500" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Continue'}
            </Button>
            <div className="text-center">
                <a href="#" className="text-sm font-medium text-gray-700 hover:text-black">Forgot Password?</a>
            </div>
          </div>
        </form>

        <div className="mt-auto pt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">No account?</p>
            <Button 
              onClick={onGoToSignup}
              className="bg-black text-white rounded-lg h-10 text-sm font-semibold hover:bg-gray-800 focus-visible:ring-black px-8"
              size="sm"
              disabled={isLoading}
            >
              Create
            </Button>
        </div>

      </div>
    </div>
  );
};

export default LoginScreen;