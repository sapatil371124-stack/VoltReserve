import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2, ShieldCheck, MapPin, Navigation, ArrowRight,
  ExternalLink, AlertCircle, Zap, CreditCard, Building2, Wallet,
  Calendar, Clock, RefreshCw
} from 'lucide-react';
import { bookingService } from '../services/api';
import { BlockchainBadge } from '../components/BlockchainBadge';
import { useAuth } from '../context/AuthContext';

export const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login } = useAuth();

  const queryRef = searchParams.get('ref');
  const queryId = searchParams.get('bookingId') || routeId;

  // Navigation state passed from station booking
  const state = location.state || {};
  const [pendingSession, setPendingSession] = useState(() => {
    if (state.slot && state.charger && state.station) {
      return { slot: state.slot, charger: state.charger, station: state.station, vehicleId: state.vehicleId };
    }
    const saved = sessionStorage.getItem('vr_pending_reservation');
    return saved ? JSON.parse(saved) : null;
  });

  const [confirmedBooking, setConfirmedBooking] = useState(state.booking || null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errorMessage, setErrorMessage] = useState('');

  // Currency & Date formatters for India
  const formatCurrencyINR = (amount) => {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatFullDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
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

  // If page is loaded or refreshed with a booking reference or ID, retrieve it from the backend
  useEffect(() => {
    if (confirmedBooking) return;

    const lookupRef = queryRef || sessionStorage.getItem('vr_last_confirmed_ref');
    const lookupId = queryId || sessionStorage.getItem('vr_last_confirmed_id');

    if (lookupRef) {
      setLoading(true);
      bookingService.getBookingByReference(lookupRef)
        .then((data) => {
          setConfirmedBooking(data);
          sessionStorage.removeItem('vr_pending_reservation');
        })
        .catch(() => {
          if (lookupId) {
            return bookingService.getBookingById(lookupId)
              .then((data) => {
                setConfirmedBooking(data);
                sessionStorage.removeItem('vr_pending_reservation');
              });
          }
        })
        .catch((err) => console.error("Error loading confirmed booking:", err))
        .finally(() => setLoading(false));
    } else if (lookupId) {
      setLoading(true);
      bookingService.getBookingById(lookupId)
        .then((data) => {
          setConfirmedBooking(data);
          sessionStorage.removeItem('vr_pending_reservation');
        })
        .catch((err) => console.error("Error loading booking by id:", err))
        .finally(() => setLoading(false));
    }
  }, [queryRef, queryId]);

  // Payment & Final Confirmation Handler
  const handleConfirmAndPay = async () => {
    if (!pendingSession || !pendingSession.slot) return;

    if (!isAuthenticated) {
      try {
        await login('rahul.sharma@example.com', 'password123');
      } catch (e) {
        navigate('/login', { state: { from: location } });
        return;
      }
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        slotId: pendingSession.slot.id,
        vehicleId: pendingSession.vehicleId || null,
        paymentMethod: paymentMethod
      };

      const res = await bookingService.confirmBooking(payload);
      setConfirmedBooking(res);
      setPendingSession(null);
      sessionStorage.removeItem('vr_pending_reservation');
      sessionStorage.setItem('vr_last_confirmed_id', res.id);
      sessionStorage.setItem('vr_last_confirmed_ref', res.bookingReference);
    } catch (err) {
      const msg = err.response?.data?.message || "Sorry, this slot has just been booked. Please select another available slot.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to Station
  const handleNavigateToStation = () => {
    if (!confirmedBooking) return;
    navigate('/stations', {
      state: {
        routeStation: {
          id: confirmedBooking.stationId,
          name: confirmedBooking.stationName,
          location: {
            address: confirmedBooking.stationAddress,
            latitude: confirmedBooking.stationLatitude,
            longitude: confirmedBooking.stationLongitude
          }
        }
      }
    });
  };

  const handleOpenGoogleMaps = () => {
    if (!confirmedBooking) return;
    const lat = confirmedBooking.stationLatitude;
    const lng = confirmedBooking.stationLongitude;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(confirmedBooking.stationName + ' ' + (confirmedBooking.stationAddress || ''))}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3 bg-[#F5F0E8]">
        <div className="w-10 h-10 border-3 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#7D6B5E] font-semibold">Retrieving verified booking record...</p>
      </div>
    );
  }

  // 1. RECREATED CONFIRMATION UI (Matches Screenshot & Section 2)
  if (confirmedBooking) {
    const isBlockchainVerified = confirmedBooking.blockchainStatus === 'VERIFIED';
    const blockIndex = confirmedBooking.blockIndex || 1;

    return (
      <div className="min-h-[85vh] bg-[#F5F0E8] py-12 px-4 sm:px-6 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] shadow-warm-xl p-6 sm:p-10 space-y-7 text-[#2D211A]">
          
          {/* A. Booking Success Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#E8F3ED] text-[#2D6A4F] flex items-center justify-center mx-auto border border-[#B7DFCA] shadow-warm-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">
                BOOKING CONFIRMED &amp; LOCKED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2D211A]">
              Ref: {confirmedBooking.bookingReference}
            </h1>

            <p className="text-xs sm:text-sm text-[#7D6B5E]">
              Your reservation is confirmed. Double-booking protection is active.
            </p>
          </div>

          {/* B. Blockchain Verification Panel (Dark Prominent Panel) */}
          <div className="bg-[#241C16] text-[#FAF7F2] rounded-2xl p-5 border border-[#3E3128] shadow-warm-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#D59A6A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D59A6A]">
                    Cryptographic Verification
                  </span>
                </div>
                <p className="text-xs text-[#FAF7F2]/90 font-medium">
                  Audited with SHA-256 Blockchain Block #{blockIndex}
                </p>
              </div>

              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  isBlockchainVerified
                    ? 'bg-[#1E3A2B] text-[#52B788] border-[#2D6A4F]'
                    : 'bg-[#3A2E1E] text-[#E0A96D] border-[#7D5A2E]'
                }`}>
                  {isBlockchainVerified ? '✓ BLOCKCHAIN VERIFIED' : (confirmedBooking.blockchainStatus || 'VERIFYING')}
                </span>
              </div>
            </div>

            {confirmedBooking.blockchainHash && (
              <div className="pt-2 border-t border-[#3E3128] flex items-center justify-between text-[11px] text-[#A69588] font-mono">
                <span className="truncate pr-2">Hash: {confirmedBooking.blockchainHash}</span>
                <span className="shrink-0 text-[#D59A6A] font-sans font-semibold">Ledger Sealed</span>
              </div>
            )}
          </div>

          {/* C. Booking Details Panel */}
          <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DFD5] space-y-3.5 text-xs sm:text-sm">
            
            {/* 1. Charging Station */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Charging Station</span>
              <span className="font-bold text-[#2D211A] text-right">{confirmedBooking.stationName}</span>
            </div>

            {/* 2. Station Location */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Station Location</span>
              <span className="font-medium text-[#2D211A] text-right max-w-xs">{confirmedBooking.stationAddress}</span>
            </div>

            {/* 3. Charger and Connector Type */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Charger &amp; Connector</span>
              <span className="font-bold text-[#9A5B35]">
                {confirmedBooking.chargerCode} • {confirmedBooking.connectorTypeCode} ({confirmedBooking.chargerPowerKw} kW DC)
              </span>
            </div>

            {/* 4. Reserved Date and Time Window */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Reserved Date &amp; Time</span>
              <span className="font-bold text-[#2D6A4F]">
                {formatFullDate(confirmedBooking.startTime)}, {formatSlotTime(confirmedBooking.startTime)} – {formatSlotTime(confirmedBooking.endTime)}
              </span>
            </div>

            {/* 5. Estimated Energy Delivery in kWh */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Estimated Energy Delivery</span>
              <span className="font-semibold text-[#2D211A]">~{Number(confirmedBooking.estimatedKwh).toFixed(2)} kWh</span>
            </div>

            {/* 6. Total Amount Paid in INR */}
            <div className="flex justify-between py-1 pt-2 items-baseline">
              <span className="font-bold text-sm text-[#2D211A]">Total Amount Paid</span>
              <span className="text-xl font-extrabold text-[#9A5B35]">
                {formatCurrencyINR(confirmedBooking.totalAmount)}
              </span>
            </div>
          </div>

          {/* D. Bottom Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleNavigateToStation}
                className="w-full py-3.5 px-6 bg-[#9A5B35] hover:bg-[#844A29] text-white text-xs sm:text-sm font-bold rounded-xl shadow-warm-md flex items-center justify-center space-x-2 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate to Station</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="w-full py-3.5 px-6 bg-[#FFFDF9] hover:bg-[#FAF7F2] border border-[#E8DFD5] text-[#2D211A] text-xs sm:text-sm font-bold rounded-xl shadow-warm-sm flex items-center justify-center space-x-2 transition-all"
              >
                <span>View in My Bookings</span>
                <ArrowRight className="w-4 h-4 text-[#9A5B35]" />
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                className="text-xs text-[#7D6B5E] hover:text-[#9A5B35] inline-flex items-center space-x-1 underline font-medium"
              >
                <span>Or open directions in Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 2. PRE-PAYMENT CONFIRMATION VIEW (When user arrives from StationDetailsPage to Confirm & Pay)
  if (pendingSession && pendingSession.slot) {
    const { station, charger, slot } = pendingSession;
    const durationMinutes = 30;
    const hours = durationMinutes / 60.0;
    const powerKw = charger.powerOutputKw || 120;
    const estimatedKwh = Math.round(powerKw * hours * 0.90 * 100) / 100;
    const pricePerKwh = charger.pricePerKwh || 18.5;
    const baseCost = Math.round(estimatedKwh * pricePerKwh * 100) / 100;
    const gstCost = Math.round(baseCost * 0.18 * 100) / 100;
    const platformFee = 15.00;
    const totalAmount = Math.round((baseCost + gstCost + platformFee) * 100) / 100;

    return (
      <div className="min-h-[85vh] bg-[#F5F0E8] py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] shadow-warm-xl space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
            <h2 className="text-xl font-bold text-[#2D211A]">Confirm Reservation &amp; Pay</h2>
            <button
              onClick={() => navigate(`/stations/${station.id}`)}
              className="text-xs font-bold text-[#9A5B35] hover:underline"
            >
              ← Change Slot
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9E3B3B] text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Reservation Conflict:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8DFD5] space-y-3.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Charging Station</span>
              <span className="font-bold text-[#2D211A] text-right">{station.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Location</span>
              <span className="font-medium text-[#2D211A] text-right">{station.location?.address || station.location?.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Reserved Date</span>
              <span className="font-semibold text-[#2D211A]">{formatFullDate(slot.startTime)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Time Window</span>
              <span className="font-bold text-[#2D6A4F]">
                {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Charger &amp; Speed</span>
              <span className="font-bold text-[#2D211A]">{charger.identifierCode} ({charger.powerOutputKw} kW DC)</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Tariff Rate</span>
              <span className="font-bold text-[#9A5B35]">₹{pricePerKwh} / kWh</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Estimated Energy</span>
              <span className="font-semibold text-[#2D211A]">~{estimatedKwh} kWh</span>
            </div>

            <div className="flex justify-between py-1 pt-2 items-baseline">
              <span className="text-sm font-bold text-[#2D211A]">Total Amount</span>
              <span className="text-xl font-extrabold text-[#9A5B35]">{formatCurrencyINR(totalAmount)}</span>
            </div>
          </div>

          {/* Test Payment Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2D211A] uppercase tracking-wider">Select Payment Mode</span>
              <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                Test Environment Sandbox
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: <Zap className="w-3.5 h-3.5 text-[#9A5B35]" /> },
                { id: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard className="w-3.5 h-3.5 text-[#9A5B35]" /> },
                { id: 'NET_BANKING', label: 'Net Banking', icon: <Building2 className="w-3.5 h-3.5 text-[#9A5B35]" /> },
                { id: 'WALLET', label: 'EV Wallet', icon: <Wallet className="w-3.5 h-3.5 text-[#9A5B35]" /> },
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === method.id
                      ? 'bg-[#FAEEE6] border-[#9A5B35] ring-1 ring-[#9A5B35]'
                      : 'bg-[#FAF7F2] border-[#E8DFD5] hover:bg-[#F5F0E8] text-[#5D4A3E]'
                  }`}
                >
                  {method.icon}
                  <span className="text-[11px] font-bold">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirmAndPay}
              disabled={loading}
              className="flex-1 py-3.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs sm:text-sm font-bold shadow-warm-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying &amp; Sealing Slot...</span>
                </>
              ) : (
                <span>Pay {formatCurrencyINR(totalAmount)} &amp; Confirm Booking</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/stations/${station.id}`)}
              className="px-4 py-3.5 bg-[#FFFDF9] hover:bg-[#FAF7F2] border border-[#E8DFD5] text-[#5D4A3E] text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3. FALLBACK WHEN ACCESSED DIRECTLY WITHOUT VALID SESSION OR BOOKING
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 bg-[#F5F0E8]">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] text-center space-y-4 shadow-warm-lg">
        <AlertCircle className="w-10 h-10 text-[#D59A6A] mx-auto" />
        <h3 className="text-lg font-bold text-[#2D211A]">No Active Reservation Found</h3>
        <p className="text-xs text-[#7D6B5E]">
          You have reached the confirmation page without an active booking session. Please choose an available charging station to reserve a slot.
        </p>
        <div className="pt-2">
          <Link
            to="/stations"
            className="inline-block px-5 py-2.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm transition-all"
          >
            Browse Charging Stations
          </Link>
        </div>
      </div>
    </div>
  );
};
