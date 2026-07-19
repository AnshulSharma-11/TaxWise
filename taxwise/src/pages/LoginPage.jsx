import { useForm } from 'react-hook-form';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      const profile = await login(values);
      toast.success(`Welcome back, ${profile.fullName?.split(' ')[0] || 'there'}!`);
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('password', { message: 'Incorrect email or password.' });
      }
      toast.error(err.message || 'Could not log you in.');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your saved calculations and dashboard."
      footer={
        <span>
          New to TaxWise?{' '}
          <NavLink to="/register">Create an account</NavLink>
        </span>
      }
    >
      <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'has-error' : ''}`}
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="input-prefix-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input ${errors.password ? 'has-error' : ''}`}
              placeholder="••••••••"
              style={{ paddingLeft: '0.85rem', paddingRight: '2.5rem' }}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '0.65rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-ink-faint)',
                display: 'flex',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : (
            <>
              Log in <LogIn size={17} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
