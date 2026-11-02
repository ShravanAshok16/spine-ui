import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import libraryBg from '../assets/library-bg.jpg';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill displayName from firstName + lastName (only if user hasn't manually edited it)
  const [displayNameTouched, setDisplayNameTouched] = useState(false);
  useEffect(() => {
    if (!displayNameTouched) {
      const auto = `${firstName} ${lastName}`.trim();
      setDisplayName(auto);
    }
  }, [firstName, lastName, displayNameTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation for immediate feedback
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        phoneNumber,
        displayName: displayName.trim() || `${firstName} ${lastName}`.trim(),
      };

      await apiClient.post('/api/Auth/register', payload);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err: any) {
      // Surface backend FluentValidation errors if present
      const data = err.response?.data;
      const message =
        data?.error ||
        data?.errors?.[0] ||
        (typeof data === 'object' && data !== null
          ? Object.values(data).flat().join(' ')
          : null) ||
        'Registration failed';
      toast.error(String(message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all shadow-sm';

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Side - Image with Color Overlay (matches Login) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src={libraryBg}
          alt="Library"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>

        <div className="relative z-10 p-16 flex flex-col justify-between w-full h-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <span className="font-serif font-bold text-xl">S</span>
            </div>
            <span className="font-serif text-2xl font-bold tracking-wide">Spine.</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
              Start building your library today.
            </h1>
            <p className="text-lg text-white/80">
              Join thousands of readers cataloging their shelves, tracking progress, and sharing books with friends.
            </p>
          </div>

          <p className="text-sm text-white/50">
            © 2026 Spine. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-bg relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-3xl font-serif font-bold mb-2">Create your account</h2>
          <p className="text-text-muted mb-8">
            Set up your Spine profile in a few seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="Ada"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Lovelace"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setDisplayNameTouched(true);
                }}
                className={inputClass}
                placeholder="How others will see you"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium shadow-sm hover:bg-primary-hover hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none mt-2"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}