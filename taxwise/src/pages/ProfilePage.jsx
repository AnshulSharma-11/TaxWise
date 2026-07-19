import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/auth';
import { formatDate } from '../utils/format';
import './ProfilePage.css';

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: { fullName: user?.fullName || '', pan: user?.pan || '' },
  });

  async function onSubmit(values) {
    try {
      await updateProfile({ ...values, pan: values.pan ? values.pan.toUpperCase() : undefined });
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Could not update your profile.');
    }
  }

  return (
    <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label className="label" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          className={`input ${errors.fullName ? 'has-error' : ''}`}
          {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Enter your full name' } })}
        />
        {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
      </div>

      <div className="field">
        <label className="label">Email</label>
        <input className="input" value={user?.email || ''} disabled />
        <span className="field-hint">Your email can't be changed.</span>
      </div>

      <div className="field">
        <label className="label" htmlFor="pan">
          PAN <span className="optional">(optional)</span>
        </label>
        <input
          id="pan"
          className={`input ${errors.pan ? 'has-error' : ''}`}
          style={{ textTransform: 'uppercase' }}
          maxLength={10}
          {...register('pan', {
            validate: (value) => !value || PAN_PATTERN.test(value.toUpperCase()) || 'Enter a valid 10-character PAN',
          })}
        />
        {errors.pan && <span className="field-error">{errors.pan.message}</span>}
      </div>

      <div className="field">
        <label className="label">Member since</label>
        <input className="input" value={formatDate(user?.createdAt)} disabled />
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
        <Save size={16} strokeWidth={2.25} />
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' } });

  const mutation = useMutation({
    mutationFn: (values) => changePassword(values),
    onSuccess: () => {
      toast.success('Password changed.');
      setSuccess(true);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Could not change your password.'),
  });

  const newPassword = watch('newPassword');

  function onSubmit({ confirmNewPassword: _confirmNewPassword, ...values }) {
    setSuccess(false);
    mutation.mutate(values);
  }

  return (
    <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label className="label" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className={`input ${errors.currentPassword ? 'has-error' : ''}`}
          {...register('currentPassword', { required: 'Enter your current password' })}
        />
        {errors.currentPassword && <span className="field-error">{errors.currentPassword.message}</span>}
      </div>

      <div className="field">
        <label className="label" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className={`input ${errors.newPassword ? 'has-error' : ''}`}
          {...register('newPassword', {
            required: 'Enter a new password',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />
        {errors.newPassword && <span className="field-error">{errors.newPassword.message}</span>}
      </div>

      <div className="field">
        <label className="label" htmlFor="confirmNewPassword">
          Confirm new password
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          className={`input ${errors.confirmNewPassword ? 'has-error' : ''}`}
          {...register('confirmNewPassword', {
            required: 'Please confirm your new password',
            validate: (value) => value === newPassword || 'Passwords do not match',
          })}
        />
        {errors.confirmNewPassword && <span className="field-error">{errors.confirmNewPassword.message}</span>}
      </div>

      <button type="submit" className="btn btn-navy" disabled={isSubmitting}>
        <KeyRound size={16} strokeWidth={2.25} />
        {isSubmitting ? 'Updating…' : 'Change password'}
      </button>
      {success && <span className="text-emerald" style={{ fontSize: '0.875rem' }}>Password updated successfully.</span>}
    </form>
  );
}

export default function ProfilePage() {
  return (
    <div className="container profile-page">
      <div className="profile-page-head">
        <span className="eyebrow">Account</span>
        <h1>Profile & settings</h1>
        <p className="text-soft">Keep your details current — they're used to personalize your saved reports.</p>
      </div>

      <div className="profile-grid">
        <div className="card card-pad">
          <div className="profile-section-head">
            <span className="profile-section-icon">
              <UserRound size={17} strokeWidth={2.25} />
            </span>
            <h3>Your details</h3>
          </div>
          <ProfileForm />
        </div>

        <div className="card card-pad">
          <div className="profile-section-head">
            <span className="profile-section-icon">
              <KeyRound size={17} strokeWidth={2.25} />
            </span>
            <h3>Password</h3>
          </div>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
