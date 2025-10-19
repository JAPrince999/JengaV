import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import { signUp } from '../firebase/auth';
import firebase from 'firebase/compat/app';

interface SignupScreenProps {
  onGoToLogin: () => void;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${className}`} {...props} />
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input type="checkbox" className={`h-4 w-4 rounded-sm border-gray-400 bg-white text-black focus:ring-black ${className}`} {...props} />
);


const SignupScreen: React.FC<SignupScreenProps> = ({ onGoToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signUp(firstName, lastName, email, password);
      // onAuthStateChanged in App.tsx will handle navigation
    } catch (err) {
      // Fix: Use firebase.FirebaseError from the compat library.
      if (err instanceof firebase.FirebaseError) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            setError('This email address is already in use.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Please choose a stronger one.');
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

        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold">JengaV</h1>
        </div>

        <div className="mb-6">
            <h2 className="text-4xl font-bold text-black">Sign Up</h2>
            <p className="text-gray-500 mt-1">Create an account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-800">First Name</Label>
            <Input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={isLoading} />
          </div>

          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-800">Last Name</Label>
            <Input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={isLoading} />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-800">Email</Label>
            <Input type="email" id="email" placeholder="email@domain.com" className="mt-1" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-800">Password</Label>
            <Input type="password" id="password" className="mt-1" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div className="pt-2">
            <Button type="submit" className="w-full bg-black text-white rounded-lg h-12 text-base font-semibold hover:bg-gray-800 focus-visible:ring-black disabled:bg-gray-500" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Continue'}
            </Button>
          </div>

          <div className="flex items-center">
            <Checkbox id="remember-me" disabled={isLoading} />
            <Label htmlFor="remember-me" className="ml-2 text-sm font-medium text-gray-700">Remember Me</Label>
          </div>
          
           <p className="text-xs text-gray-500 text-center !mt-6">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline hover:text-black">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-black">Privacy Policy</a>
           </p>

        </form>

        <div className="mt-auto pt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
            <Button 
              onClick={onGoToLogin}
              className="bg-black text-white rounded-lg h-10 text-sm font-semibold hover:bg-gray-800 focus-visible:ring-black px-8"
              size="sm"
              disabled={isLoading}
            >
              Log In
            </Button>
        </div>

      </div>
    </div>
  );
};

export default SignupScreen;