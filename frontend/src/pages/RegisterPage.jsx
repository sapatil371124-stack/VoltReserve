import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_USER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F5F0E8]">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] shadow-warm-xl space-y-6 relative overflow-hidden">
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] mx-auto flex items-center justify-center mb-3 shadow-warm-sm">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D211A]">Create Account</h2>
          <p className="text-xs text-[#7D6B5E] mt-1">Join VoltReserve for advance EV charging reservations</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] flex items-start space-x-2.5 text-[#9E3B3B] text-xs">
            <AlertCircle className="w-4 h-4 text-[#9E3B3B] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8B786A] absolute left-3.5 top-3" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B786A] absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8B786A] absolute left-3.5 top-3" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B786A] absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1">
                Confirm
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B786A] absolute left-3 top-3" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] placeholder-[#8B786A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#5D4A3E] uppercase tracking-wider block mb-1">
              Account Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
            >
              <option value="ROLE_USER">EV Driver / Owner</option>
              <option value="ROLE_ADMIN">Station Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-sm font-bold shadow-warm-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#7D6B5E]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#9A5B35] hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
