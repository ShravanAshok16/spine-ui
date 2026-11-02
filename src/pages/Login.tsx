import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import libraryBg from '../assets/library-bg.jpg';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/api/Auth/login', { identifier, password });
      login(res.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Side - Image with Color Overlay */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* The background image */}
        <img 
          src={libraryBg} 
          alt="Library" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* The indigo color overlay (80% opacity) */}
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        
        {/* Content on top of the image */}
        <div className="relative z-10 p-16 flex flex-col justify-between w-full h-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <span className="font-serif font-bold text-xl">S</span>
            </div>
            <span className="font-serif text-2xl font-bold tracking-wide">Spine.</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">
              Every book you own, in your pocket.
            </h1>
            <p className="text-lg text-white/80">
              Track your reading progress, share your library with friends, and never buy a duplicate book again.
            </p>
          </div>
          
          <p className="text-sm text-white/50">
            © 2026 Spine. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-bg relative">
        
        {/* THEME TOGGLE */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-3xl font-serif font-bold mb-2">Welcome back</h2>
          <p className="text-text-muted mb-8">Enter your details to access your library.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all shadow-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium shadow-sm hover:bg-primary-hover hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none mt-2"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}