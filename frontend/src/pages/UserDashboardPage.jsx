import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, CalendarCheck, Car, Compass, ArrowRight, ShieldCheck, Clock, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService, vehicleService } from '../services/api';
import { BlockchainBadge } from '../components/BlockchainBadge';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookingService.getMyBookings(),
      vehicleService.getMyVehicles()
    ]).then(([bData, vData]) => {
      setBookings(bData);
      setVehicles(vData);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'OCCUPIED');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  const totalKwh = pastBookings.reduce((sum, b) => sum + Number(b.estimatedKwh || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F5F0E8] min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#9A5B35]">Driver Control Center</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D211A]">Welcome back, {user?.fullName || 'Driver'}!</h1>
          <p className="text-xs sm:text-sm text-[#7D6B5E]">
            Smart reservation active with real-time slot synchronization and SHA-256 tamper auditing.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/stations"
            className="px-5 py-3 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-2xl text-xs font-bold shadow-warm-md transition-all flex items-center space-x-2"
          >
            <span>Reserve New Slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E8DFD5] shadow-warm-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAEEE6] border border-[#E8B89C] text-[#9A5B35] flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-[#8B786A] block">Active Bookings</span>
            <span className="text-2xl font-bold text-[#2D211A] mt-0.5 block">{activeBookings.length}</span>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E8DFD5] shadow-warm-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F3ED] border border-[#B7DFCA] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-[#8B786A] block">Energy Consumed</span>
            <span className="text-2xl font-bold text-[#2D6A4F] mt-0.5 block">~{Math.round(totalKwh)} kWh</span>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E8DFD5] shadow-warm-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#9A5B35] flex items-center justify-center shrink-0 border border-[#E8DFD5]">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-[#8B786A] block">Registered EVs</span>
            <span className="text-2xl font-bold text-[#2D211A] mt-0.5 block">{vehicles.length}</span>
          </div>
        </div>
      </div>

      {/* Active Reservations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2D211A]">Upcoming Reservations</h2>
          <Link to="/bookings" className="text-xs font-bold text-[#9A5B35] hover:text-[#844A29] hover:underline">
            View All ({bookings.length})
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] text-center space-y-3 shadow-warm-sm">
            <Clock className="w-8 h-8 text-[#A69588] mx-auto" />
            <p className="text-xs text-[#7D6B5E] font-medium">No active charging reservations right now.</p>
            <Link
              to="/stations"
              className="inline-block px-4 py-2 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm transition-all"
            >
              Browse Nearby Stations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#E8DFD5] shadow-warm-sm hover:border-[#D59A6A] transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#9A5B35]">
                      #{b.bookingReference}
                    </span>
                    <h4 className="text-base font-bold text-[#2D211A] mt-1">{b.stationName}</h4>
                    <p className="text-xs text-[#7D6B5E]">{b.stationAddress}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8DFD5]">
                  <span className="font-bold text-[#2D211A]">{b.chargerCode} ({b.chargerPowerKw} kW)</span>
                  <span className="font-bold text-[#9A5B35]">
                    {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <BlockchainBadge
                    bookingId={b.id}
                    blockIndex={b.blockIndex}
                    transactionHash={b.blockchainHash}
                    initialStatus={b.blockchainStatus || 'VERIFIED'}
                  />
                  <Link
                    to="/bookings"
                    className="text-xs font-bold text-[#9A5B35] hover:text-[#844A29] flex items-center space-x-1"
                  >
                    <span>Manage Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
