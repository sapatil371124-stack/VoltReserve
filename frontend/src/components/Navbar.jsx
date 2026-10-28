import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, MapPin, Compass, GitCompare, CalendarCheck, Car, User, LogOut, Menu, X, LayoutDashboard, Sparkles, BatteryCharging } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicle } from '../context/VehicleContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { activeVehicle, currentSoc, estimatedRange, setShowConfirmModal } = useVehicle();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-xl border-b border-[#E8DFD5] shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#9A5B35] flex items-center justify-center text-white shadow-warm-md group-hover:bg-[#844A29] transition-all duration-300">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#2D211A] leading-none">
                  Volt<span className="text-[#9A5B35]">Reserve</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] tracking-wider">
                  EV
                </span>
              </div>
              <span className="text-[11px] tracking-wide text-[#7D6B5E] font-medium mt-0.5">
                Smart Charging &amp; Reservation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            <Link
              to="/stations"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/stations') 
                  ? 'bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] shadow-warm-sm' 
                  : 'text-[#5D4A3E] hover:text-[#2D211A] hover:bg-[#F5F0E8]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#9A5B35]" />
              <span>Find Stations</span>
            </Link>

            <Link
              to="/recommendations"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/recommendations') 
                  ? 'bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] shadow-warm-sm' 
                  : 'text-[#5D4A3E] hover:text-[#2D211A] hover:bg-[#F5F0E8]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D59A6A]" />
              <span>Smart Pick</span>
            </Link>

            <Link
              to="/compare"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/compare') 
                  ? 'bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] shadow-warm-sm' 
                  : 'text-[#5D4A3E] hover:text-[#2D211A] hover:bg-[#F5F0E8]'
              }`}
            >
              <GitCompare className="w-4 h-4 text-[#9A5B35]" />
              <span>Compare</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                    isActive('/bookings') 
                      ? 'bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] shadow-warm-sm' 
                      : 'text-[#5D4A3E] hover:text-[#2D211A] hover:bg-[#F5F0E8]'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-[#9A5B35]" />
                  <span>My Bookings</span>
                </Link>

                <Link
                  to="/vehicles"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                    isActive('/vehicles') 
                      ? 'bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] shadow-warm-sm' 
                      : 'text-[#5D4A3E] hover:text-[#2D211A] hover:bg-[#F5F0E8]'
                  }`}
                >
                  <Car className="w-4 h-4 text-[#7D6B5E]" />
                  <span>Garage</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive('/admin') 
                    ? 'bg-[#2D211A] text-white shadow-warm-sm' 
                    : 'text-[#2D211A] hover:bg-[#F5F0E8] border border-[#E8DFD5]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#D59A6A]" />
                <span>Admin Hub</span>
              </Link>
            )}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#FAEEE6] hover:bg-[#F3DDD0] border border-[#E8B89C] text-xs font-bold text-[#9A5B35] transition-all shadow-warm-xs"
              title="Click to change vehicle or update battery status"
            >
              <BatteryCharging className="w-4 h-4 text-[#9A5B35]" />
              <span className="max-w-[130px] truncate">{activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Set Vehicle'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"></span>
              <span className="text-[#2D211A] font-extrabold">{currentSoc}%</span>
              <span className="text-[#7D6B5E] text-[10px] font-normal hidden xl:inline">({estimatedRange} km)</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F5F0E8] hover:bg-[#EFE7DC] border border-[#E8DFD5] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#9A5B35] text-white flex items-center justify-center font-bold text-xs">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-[#2D211A] leading-none">{user?.fullName || 'User'}</p>
                    <p className="text-[10px] text-[#7D6B5E] mt-0.5 leading-none">{user?.role?.replace('ROLE_', '')}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-[#7D6B5E] hover:text-[#2D211A] hover:bg-[#F5F0E8] border border-transparent hover:border-[#E8DFD5] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#5D4A3E] hover:text-[#2D211A] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2 text-sm font-bold bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#5D4A3E] hover:text-[#2D211A] hover:bg-[#F5F0E8] border border-[#E8DFD5]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF9] border-b border-[#E8DFD5] px-4 pt-3 pb-6 space-y-2 shadow-warm-lg">
          <Link
            to="/stations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2D211A] hover:bg-[#F5F0E8]"
          >
            <Compass className="w-4 h-4 text-[#9A5B35]" />
            <span>Find Stations</span>
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2D211A] hover:bg-[#F5F0E8]"
          >
            <Sparkles className="w-4 h-4 text-[#D59A6A]" />
            <span>Smart Recommendations</span>
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2D211A] hover:bg-[#F5F0E8]"
          >
            <GitCompare className="w-4 h-4 text-[#9A5B35]" />
            <span>Compare Stations</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2D211A] hover:bg-[#F5F0E8]"
              >
                <CalendarCheck className="w-4 h-4 text-[#9A5B35]" />
                <span>My Bookings</span>
              </Link>
              <Link
                to="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2D211A] hover:bg-[#F5F0E8]"
              >
                <Car className="w-4 h-4 text-[#7D6B5E]" />
                <span>Vehicle Fleet</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#2D211A] hover:bg-[#F5F0E8]"
              >
                <User className="w-4 h-4 text-[#9A5B35]" />
                <span>Driver Dashboard</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2D211A]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#D59A6A]" />
                  <span>Admin Hub</span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-[#E8DFD5] flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-semibold text-sm text-[#5D4A3E] border border-[#E8DFD5] hover:bg-[#F5F0E8]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl font-bold text-sm bg-[#9A5B35] text-white shadow-warm-md hover:bg-[#844A29]"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
