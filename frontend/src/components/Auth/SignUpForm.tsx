import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpForm() {
  const { signUp } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError('');
      setLoading(true);
      await signUp(data.email, data.password);
    } catch (err) {
      setError('Failed to create account. Email may already be in use.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Email
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          type="email"
          id="email"
          className="input-field block w-full"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Password
        </label>
        <input
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          type="password"
          id="password"
          className="input-field block w-full"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Confirm Password
        </label>
        <input
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
          type="password"
          id="confirmPassword"
          className="input-field block w-full"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
