import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
    setLoading(true);
    try {
      const data = await login(quickEmail, quickPassword);
      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F5F0E8]">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] shadow-warm-xl space-y-6 relative overflow-hidden">
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] mx-auto flex items-center justify-center mb-3 shadow-warm-sm">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D211A]">Welcome Back</h2>
          <p className="text-xs text-[#7D6B5E] mt-1">Sign in to your VoltReserve account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] flex items-start space-x-2.5 text-[#9E3B3B] text-xs">
            <AlertCircle className="w-4 h-4 text-[#9E3B3B] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B786A] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-sm text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8B786A] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-sm text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-sm font-bold shadow-warm-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Accounts */}
        <div className="pt-2 border-t border-[#E8DFD5] space-y-2">
          <span className="text-[10px] font-bold text-[#8B786A] uppercase tracking-wider block text-center">
            One-Click Verified Access
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('rahul.sharma@example.com', 'password123')}
              className="p-2.5 bg-[#FAF7F2] hover:bg-[#FAEEE6] text-[#2D211A] rounded-xl border border-[#E8DFD5] hover:border-[#E8B89C] text-left transition-colors shadow-warm-sm"
            >
              <span className="font-bold block text-[11px] text-[#9A5B35]">Rahul (Driver)</span>
              <span className="text-[10px] text-[#7D6B5E]">Instant Login</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@voltreserve.com', 'admin123')}
              className="p-2.5 bg-[#FAF7F2] hover:bg-[#FAEEE6] text-[#2D211A] rounded-xl border border-[#E8DFD5] hover:border-[#E8B89C] text-left transition-colors shadow-warm-sm"
            >
              <span className="font-bold block text-[11px] text-[#2D211A]">Admin Hub</span>
              <span className="text-[10px] text-[#7D6B5E]">Instant Login</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#7D6B5E]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#9A5B35] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
