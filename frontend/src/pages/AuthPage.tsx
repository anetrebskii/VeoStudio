import { useState } from 'react';
import { SignInForm } from '@/components/Auth/SignInForm';
import { SignUpForm } from '@/components/Auth/SignUpForm';
import { Video } from 'lucide-react';

export function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Video Studio
          </h1>
          <p className="text-gray-400">
            Create amazing videos with Google Veo 3
          </p>
        </div>

        <div className="card p-8">
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 ${isSignIn ? 'tab-button tab-button-active' : 'tab-button tab-button-inactive'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 ${!isSignIn ? 'tab-button tab-button-active' : 'tab-button tab-button-inactive'}`}
            >
              Sign Up
            </button>
          </div>

          {isSignIn ? <SignInForm /> : <SignUpForm />}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by Google Veo 3 API
        </p>
      </div>
    </div>
  );
}
