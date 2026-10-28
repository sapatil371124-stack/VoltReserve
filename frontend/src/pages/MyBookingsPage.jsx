import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Clock, MapPin, Zap, ShieldCheck, XCircle,
  Navigation, Play, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { bookingService } from '../services/api';
import { BlockchainBadge } from '../components/BlockchainBadge';

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [simulatingId, setSimulatingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    bookingService.getMyBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this confirmed reservation?")) return;
    setCancellingId(bookingId);
    try {
      await bookingService.cancelBooking(bookingId, "Cancelled by user");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleSimulateStatus = async (bookingId, nextStatus) => {
    setSimulatingId(bookingId);
    try {
      await bookingService.simulateSession(bookingId, nextStatus);
      fetchBookings();
    } catch (err) {
      alert("Failed to advance charging session.");
    } finally {
      setSimulatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">CONFIRMED</span>;
      case 'OCCUPIED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] animate-pulse">CHARGING IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD5]">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDE8E8] text-[#9E3B3B] border border-[#F8B4B4]">CANCELLED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD5]">{status}</span>;
    }
  };

  const formatSlotTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F5F0E8] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#9A5B35]">Driver History</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D211A] mt-1">My Reservations</h1>
          <p className="text-xs sm:text-sm text-[#7D6B5E] mt-1">
            Real-time session status, cryptographic SHA-256 block ledger verification, and hardware controls.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-[#FFFDF9] hover:bg-[#FAF7F2] border border-[#E8DFD5] text-[#2D211A] text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-auto shadow-warm-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#9A5B35]" />
          <span>Refresh Records</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7D6B5E] font-medium">Loading booking history...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-12 border border-[#E8DFD5] text-center space-y-4 max-w-md mx-auto shadow-warm-sm">
          <CalendarCheck className="w-12 h-12 text-[#A69588] mx-auto" />
          <h3 className="text-base font-bold text-[#2D211A]">No Reservations Yet</h3>
          <p className="text-xs text-[#7D6B5E]">You haven't reserved any charging slots yet. Explore available stations to book ahead.</p>
          <Link
            to="/stations"
            className="inline-block px-5 py-2.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm"
          >
            Find a Charging Station
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD5] shadow-warm-sm hover:shadow-warm-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DFD5] gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#9A5B35]">
                      #{b.bookingReference}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>
                  <h3 className="text-lg font-bold text-[#2D211A]">{b.stationName}</h3>
                  <p className="text-xs text-[#7D6B5E] flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#A69588]" />
                    {b.stationAddress}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end space-y-2">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Total Amount</span>
                    <span className="text-xl font-bold text-[#9A5B35]">₹{Number(b.totalAmount).toFixed(2)}</span>
                  </div>
                  <BlockchainBadge
                    bookingId={b.id}
                    blockIndex={b.blockIndex}
                    transactionHash={b.blockchainHash}
                    initialStatus={b.blockchainStatus || 'VERIFIED'}
                  />
                </div>
              </div>

              {/* Hardware Specs & Time Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD5]">
                  <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Charger Gun</span>
                  <span className="font-bold text-[#2D211A]">{b.chargerCode}</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD5]">
                  <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Connector Speed</span>
                  <span className="font-bold text-[#2D6A4F]">{b.chargerPowerKw} kW ({b.connectorTypeCode})</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD5]">
                  <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Time Window</span>
                  <span className="font-semibold text-[#2D211A]">
                    {formatSlotTime(b.startTime)} – {formatSlotTime(b.endTime)}
                  </span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFD5]">
                  <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Date</span>
                  <span className="font-semibold text-[#2D211A]">
                    {formatFullDate(b.startTime)}
                  </span>
                </div>
              </div>

              {/* Session Simulation & Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DFD5]">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-[#8B786A] uppercase tracking-wider">Hardware Simulation:</span>
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleSimulateStatus(b.id, 'OCCUPIED')}
                      disabled={simulatingId === b.id}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F5F0E8] text-[#9A5B35] border border-[#E8DFD5] rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Plug-in EV (Start Charge)</span>
                    </button>
                  )}
                  {b.status === 'OCCUPIED' && (
                    <button
                      onClick={() => handleSimulateStatus(b.id, 'COMPLETED')}
                      disabled={simulatingId === b.id}
                      className="px-3 py-1.5 bg-[#E8F3ED] hover:bg-[#D9EFE2] text-[#2D6A4F] border border-[#B7DFCA] rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete Session</span>
                    </button>
                  )}
                  {b.status === 'COMPLETED' && (
                    <span className="text-xs text-[#2D6A4F] font-semibold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Dispenser unlocked &amp; ledger sealed
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Navigate to Station button */}
                  <button
                    onClick={() => navigate('/stations', {
                      state: {
                        routeStation: {
                          id: b.stationId,
                          name: b.stationName,
                          location: {
                            address: b.stationAddress,
                            latitude: b.stationLatitude,
                            longitude: b.stationLongitude
                          }
                        }
                      }
                    })}
                    className="px-3.5 py-1.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-warm-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-3 py-1.5 rounded-xl border border-[#E8DFD5] text-[#9E3B3B] hover:bg-[#FDE8E8] text-xs font-bold transition-colors"
                    >
                      {cancellingId === b.id ? 'Releasing...' : 'Cancel Slot'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
