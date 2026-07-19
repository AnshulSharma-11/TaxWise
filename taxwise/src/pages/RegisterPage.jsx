import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', pan: '' } });

  const password = watch('password');

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }) => {
    try {
      const payload = { ...values, pan: values.pan ? values.pan.toUpperCase() : undefined };
      const profile = await registerUser(payload);
      toast.success(`Account created — welcome, ${profile.fullName?.split(' ')[0] || 'there'}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Could not create your account.');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free to use — takes less than a minute."
      footer={
        <span>
          Already have an account? <NavLink to="/login">Log in</NavLink>
        </span>
      }
    >
      <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className={`input ${errors.fullName ? 'has-error' : ''}`}
            placeholder="As per your PAN card"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Enter your full name' },
            })}
          />
          {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
        </div>

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
          <label className="label" htmlFor="pan">
            PAN <span className="optional">(optional)</span>
          </label>
          <input
            id="pan"
            type="text"
            maxLength={10}
            className={`input ${errors.pan ? 'has-error' : ''}`}
            placeholder="ABCDE1234F"
            style={{ textTransform: 'uppercase' }}
            {...register('pan', {
              validate: (value) =>
                !value || PAN_PATTERN.test(value.toUpperCase()) || 'Enter a valid 10-character PAN',
            })}
          />
          {errors.pan ? (
            <span className="field-error">{errors.pan.message}</span>
          ) : (
            <span className="field-hint">Used only to personalize your saved reports.</span>
          )}
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="input-prefix-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input ${errors.password ? 'has-error' : ''}`}
              placeholder="At least 8 characters"
              style={{ paddingLeft: '0.85rem', paddingRight: '2.5rem' }}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
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

        <div className="field">
          <label className="label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input ${errors.confirmPassword ? 'has-error' : ''}`}
            placeholder="Re-enter your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : (
            <>
              Create account <UserPlus size={17} />
            </>
          )}
        </button>

        <p className="text-faint" style={{ fontSize: '0.75rem', textAlign: 'center' }}>
          By continuing you agree this tool provides estimates only and is not a substitute for professional tax
          advice.
        </p>
      </form>
    </AuthLayout>
  );
}
