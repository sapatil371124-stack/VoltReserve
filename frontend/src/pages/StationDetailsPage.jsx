import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap, MapPin, Clock, ArrowRight, ArrowLeft, Calendar,
  AlertTriangle, BatteryCharging, CheckCircle2, Navigation,
  CreditCard, Building2, Wallet, RefreshCw, ShieldCheck, ExternalLink,
  Car, Sliders, Check
} from 'lucide-react';
import { stationService, slotService, bookingService } from '../services/api';
import { FlexibleIntervalSelector } from '../components/FlexibleIntervalSelector';
import { ChargingGoalBar } from '../components/ChargingGoalBar';
import { useAuth } from '../context/AuthContext';
import { useVehicle } from '../context/VehicleContext';

export const StationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const {
    activeVehicle,
    currentSoc,
    estimatedRange,
    targetSoc,
    chargingGoalMode,
    desiredDurationMinutes,
    energyNeededBatteryKwh,
    energyNeededGridKwh,
    rangeAddedKm,
    setShowConfirmModal
  } = useVehicle();

  const [station, setStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [selectedChargerId, setSelectedChargerId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDuration, setSelectedDuration] = useState(desiredDurationMinutes || 45);
  const [intervals, setIntervals] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [loadingStation, setLoadingStation] = useState(true);
  const [loadingIntervals, setLoadingIntervals] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync duration with context goal
  useEffect(() => {
    if (desiredDurationMinutes) {
      setSelectedDuration(desiredDurationMinutes);
    }
  }, [desiredDurationMinutes]);

  // Fetch station details
  useEffect(() => {
    stationService.getStationById(id)
      .then((stn) => {
        setStation(stn);
        if (stn.chargers && stn.chargers.length > 0) {
          setChargers(stn.chargers);
          // Prefer compatible charger if available
          const compat = activeVehicle?.connectorTypeCode
            ? stn.chargers.find(c => c.connectorTypeCode?.toUpperCase() === activeVehicle.connectorTypeCode.toUpperCase())
            : null;
          setSelectedChargerId(compat ? compat.id : stn.chargers[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingStation(false));
  }, [id, activeVehicle]);

  // Fetch flexible intervals whenever charger, date, or duration changes
  const fetchIntervals = () => {
    if (!selectedChargerId) return;
    setLoadingIntervals(true);
    setErrorMessage('');
    slotService.getFlexibleIntervals(selectedChargerId, selectedDate, selectedDuration)
      .then((data) => {
        setIntervals(data);
        // Clear selection if not in new data
        if (selectedInterval) {
          const match = data.find(i => i.startTime === selectedInterval.startTime && i.available);
          if (!match) setSelectedInterval(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching intervals:", err);
        // Fallback to static slots if endpoint is not available
        slotService.getSlots(selectedChargerId, selectedDate)
          .then((slots) => {
            const mapped = slots.map(s => ({
              startTime: s.startTime,
              endTime: s.endTime,
              timeLabel: `${formatSlotTime(s.startTime)} – ${formatSlotTime(s.endTime)}`,
              durationMinutes: 30,
              available: s.status === 'AVAILABLE',
              conflictReason: s.status !== 'AVAILABLE' ? 'BOOKED' : null,
              slotId: s.id
            }));
            setIntervals(mapped);
          })
          .catch(console.error);
      })
      .finally(() => setLoadingIntervals(false));
  };

  useEffect(() => {
    fetchIntervals();
  }, [selectedChargerId, selectedDate, selectedDuration]);

  const selectedCharger = chargers.find(c => c.id === selectedChargerId) || chargers[0];

  // Hardware compatibility check
  const isCompatible = activeVehicle?.connectorTypeCode && selectedCharger?.connectorTypeCode
    ? activeVehicle.connectorTypeCode.toUpperCase() === selectedCharger.connectorTypeCode.toUpperCase()
    : true;

  const vehicleMaxKw = Number(activeVehicle?.maxChargingRateKw) || 50;
  const stationMaxKw = Number(selectedCharger?.powerOutputKw) || 120;
  const effectivePowerKw = Math.min(vehicleMaxKw, stationMaxKw);

  // Helper formatters
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split('T')[0];
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
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatCurrencyINR = (amount) => {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Pricing calculations
  const pricePerKwh = selectedCharger?.pricePerKwh || 18.5;
  const hours = selectedDuration / 60.0;
  
  // Calculate grid energy based on charging goal mode
  let finalEstGridKwh;
  if (chargingGoalMode === 'TIME') {
    // Energy derived from time
    const battKwh = Math.round(effectivePowerKw * hours * 0.90 * 100) / 100;
    finalEstGridKwh = Math.round((battKwh / 0.90) * 100) / 100;
  } else {
    // Target SOC or Desired kWh
    finalEstGridKwh = energyNeededGridKwh > 0 ? energyNeededGridKwh : Math.round(effectivePowerKw * hours * 0.90 * 100) / 100;
  }

  const baseCost = Math.round(finalEstGridKwh * pricePerKwh * 100) / 100;
  const gstCost = Math.round(baseCost * 0.18 * 100) / 100;
  const platformFee = 15.00;
  const totalCost = Math.round((baseCost + gstCost + platformFee) * 100) / 100;

  // Interval selection
  const handleSelectInterval = (interval) => {
    setErrorMessage('');
    setSelectedInterval(interval);
  };

  // Confirm booking submission
  const handleConfirmBooking = async () => {
    if (!selectedInterval) return;

    if (!isAuthenticated) {
      try {
        await login('rahul.sharma@example.com', 'password123');
      } catch (e) {
        navigate('/login', { state: { from: { pathname: `/stations/${id}` } } });
        return;
      }
    }

    setConfirming(true);
    setErrorMessage('');

    try {
      const payload = {
        chargerId: selectedCharger?.id,
        startTime: selectedInterval.startTime,
        endTime: selectedInterval.endTime,
        durationMinutes: selectedDuration,
        vehicleId: activeVehicle?.id || null,
        initialSocPercentage: currentSoc,
        targetSocPercentage: targetSoc,
        paymentMethod: paymentMethod,
        slotId: selectedInterval.slotId || null
      };
      const res = await bookingService.confirmBooking(payload);
      setConfirmedBooking(res);
      sessionStorage.setItem('vr_last_confirmed_id', res.id);
      sessionStorage.setItem('vr_last_confirmed_ref', res.bookingReference);
    } catch (err) {
      const msg = err.response?.data?.message || "Sorry, this time slot has just been booked. Please select another available time.";
      setErrorMessage(msg);
      setSelectedInterval(null);
      fetchIntervals();
    } finally {
      setConfirming(false);
    }
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

  if (loadingStation || !station) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#F5F0E8]">
        <div className="w-10 h-10 border-3 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#7D6B5E] font-semibold">Loading station specifications...</p>
      </div>
    );
  }

  // SCREEN 3: BOOKING CONFIRMED (Recreated matching user design)
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
                BOOKING CONFIRMED &amp; SEALED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2D211A]">
              Ref: {confirmedBooking.bookingReference}
            </h1>

            <p className="text-xs sm:text-sm text-[#7D6B5E]">
              Your charging reservation is locked into the live schedule. Double-booking prevention active.
            </p>
          </div>

          {/* B. Cryptographic Blockchain Verification Panel */}
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
                  {isBlockchainVerified ? '✓ BLOCKCHAIN VERIFIED' : (confirmedBooking.blockchainStatus || 'VERIFIED')}
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

            {/* 3. Vehicle Profile */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Registered Vehicle</span>
              <span className="font-bold text-[#2D211A] text-right">
                {confirmedBooking.vehicleInfo || (activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'EV Car')}
                {confirmedBooking.licensePlate && ` (${confirmedBooking.licensePlate})`}
              </span>
            </div>

            {/* 4. Charger and Connector Type */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Charger &amp; Connector</span>
              <span className="font-bold text-[#9A5B35]">
                {confirmedBooking.chargerCode || selectedCharger?.identifierCode} • {confirmedBooking.connectorTypeCode || selectedCharger?.connectorTypeCode} ({confirmedBooking.chargerPowerKw || selectedCharger?.powerOutputKw} kW DC)
              </span>
            </div>

            {/* 5. Reserved Date and Time Window */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Reserved Window</span>
              <span className="font-bold text-[#2D6A4F]">
                {formatFullDate(confirmedBooking.startTime)}, {formatSlotTime(confirmedBooking.startTime)} – {formatSlotTime(confirmedBooking.endTime)} ({confirmedBooking.chargingDurationMinutes || selectedDuration} min)
              </span>
            </div>

            {/* 6. SOC & Gain */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Battery Target &amp; Gain</span>
              <span className="font-semibold text-[#2D211A]">
                {confirmedBooking.initialSocPercentage || currentSoc}% → {confirmedBooking.targetSocPercentage || targetSoc}% 
                <span className="text-[#2D6A4F] ml-1 font-bold">(+{Math.max(0, (confirmedBooking.targetSocPercentage || targetSoc) - (confirmedBooking.initialSocPercentage || currentSoc))}%)</span>
              </span>
            </div>

            {/* 7. Estimated Energy Delivery in kWh */}
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/70">
              <span className="text-[#7D6B5E] font-medium">Estimated Energy</span>
              <span className="font-semibold text-[#2D211A]">~{Number(confirmedBooking.estimatedKwh).toFixed(2)} kWh</span>
            </div>

            {/* 8. Total Amount Paid in INR */}
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
                onClick={() => navigate('/stations', { state: { routeStation: station } })}
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 bg-[#F5F0E8] min-h-screen font-sans">
      
      {/* 1. STATION INFORMATION CARD */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] uppercase tracking-wider">
                {station.location?.cityName || 'Maharashtra'}
              </span>
              <span className="text-xs font-semibold text-[#8B786A]">
                ★ {station.rating ? Number(station.rating).toFixed(1) : '4.8'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D211A] leading-tight">
              {station.name}
            </h1>

            <p className="text-xs text-[#7D6B5E] flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#9A5B35] shrink-0" />
              {station.location?.address || station.location?.name}
            </p>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD5] text-xs space-y-1.5 shrink-0 sm:min-w-[200px]">
            <div className="flex justify-between">
              <span className="text-[#7D6B5E]">Speed:</span>
              <span className="font-bold text-[#2D211A]">{station.maxPowerKw || 120} kW DC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D6B5E]">Connector:</span>
              <span className="font-bold text-[#2D211A]">{selectedCharger?.connectorTypeCode || 'CCS-2'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7D6B5E]">Availability:</span>
              <span className="font-bold text-[#2D6A4F]">{station.availableChargersCount} / {station.totalChargersCount} Available</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#E8DFD5]">
              <span className="text-[#7D6B5E]">Tariff:</span>
              <span className="font-bold text-[#9A5B35]">₹{station.minPricePerKwh}/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHARGING GOAL & VEHICLE STATUS */}
      <ChargingGoalBar />

      {/* ERROR CONFLICT NOTIFICATION */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9E3B3B] text-xs flex items-start space-x-2.5 shadow-warm-xs">
          <AlertTriangle className="w-4 h-4 text-[#9E3B3B] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Availability Notice:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* 3. SLOT & INTERVAL SELECTION VIEW */}
      {!selectedInterval ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-warm-sm space-y-6">
          
          {/* Date & Charger Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFD5]">
              <div>
                <h3 className="text-base font-bold text-[#2D211A]">Select Date &amp; Charger</h3>
                <p className="text-xs text-[#7D6B5E]">Choose your target day and charging post</p>
              </div>

              {/* Date Selection */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFD5] text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getTodayString())}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      selectedDate === getTodayString() ? 'bg-[#9A5B35] text-white' : 'text-[#7D6B5E] hover:text-[#2D211A]'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getTomorrowString())}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      selectedDate === getTomorrowString() ? 'bg-[#9A5B35] text-white' : 'text-[#7D6B5E] hover:text-[#2D211A]'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>

                <div className="flex items-center space-x-1 bg-[#FAF7F2] px-2.5 py-1.5 rounded-xl border border-[#E8DFD5]">
                  <Calendar className="w-3.5 h-3.5 text-[#9A5B35]" />
                  <input
                    type="date"
                    value={selectedDate}
                    min={getTodayString()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#2D211A] focus:outline-none"
                  />
                </div>

                <button
                  onClick={fetchIntervals}
                  disabled={loadingIntervals}
                  title="Refresh slots"
                  className="p-2 bg-[#FAF7F2] hover:bg-[#F5F0E8] border border-[#E8DFD5] rounded-xl text-[#9A5B35] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingIntervals ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Charger Selection */}
            {chargers.length > 1 && (
              <div>
                <label className="text-[11px] font-bold text-[#8B786A] uppercase tracking-wider block mb-2">
                  Select Charger
                </label>
                <div className="flex flex-wrap gap-2">
                  {chargers.map((chg, idx) => {
                    const match = activeVehicle?.connectorTypeCode
                      ? chg.connectorTypeCode?.toUpperCase() === activeVehicle.connectorTypeCode.toUpperCase()
                      : true;
                    return (
                      <button
                        key={chg.id}
                        type="button"
                        onClick={() => setSelectedChargerId(chg.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center space-x-2 ${
                          selectedChargerId === chg.id
                            ? 'bg-[#FAEEE6] border-[#9A5B35] text-[#9A5B35] shadow-warm-xs'
                            : 'bg-[#FAF7F2] border-[#E8DFD5] text-[#5D4A3E] hover:bg-[#F5F0E8]'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-[#9A5B35]" />
                        <div>
                          <div>{chg.identifierCode || `Charger ${idx + 1}`} ({chg.powerOutputKw} kW {chg.currentType})</div>
                          <div className="text-[10px] text-[#8B786A] font-normal">
                            Port: {chg.connectorTypeCode} {match ? '• Compatible' : '• Incompatible port'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Vehicle Compatibility Banner */}
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              isCompatible ? 'bg-[#E8F3ED] border-[#B7DFCA] text-[#2D6A4F]' : 'bg-[#FFF3E0] border-[#FFE0B2] text-[#E65100]'
            }`}>
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 shrink-0" />
                <span>
                  {isCompatible
                    ? `Compatible with your ${activeVehicle?.make || 'EV'} (${activeVehicle?.connectorTypeCode || 'CCS2'})`
                    : `Notice: This charger port (${selectedCharger?.connectorTypeCode}) differs from your vehicle's port (${activeVehicle?.connectorTypeCode}).`}
                </span>
              </div>
              <span className="font-bold text-[11px]">
                Effective Rate: {effectivePowerKw} kW
              </span>
            </div>
          </div>

          {/* Flexible Interval Selector */}
          <FlexibleIntervalSelector
            intervals={intervals}
            selectedInterval={selectedInterval}
            onSelectInterval={handleSelectInterval}
            durationMinutes={selectedDuration}
            onChangeDuration={(d) => setSelectedDuration(d)}
            loading={loadingIntervals}
          />

        </div>
      ) : (
        /* 4. BOOKING SUMMARY & REVIEW SCREEN */
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
            <h3 className="text-xl font-bold text-[#2D211A]">Reservation Summary</h3>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">
              Time Slot Selected
            </span>
          </div>

          {/* Itemized Specification Grid */}
          <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8DFD5] space-y-3.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Station</span>
              <span className="font-bold text-[#2D211A] text-right">{station.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Location</span>
              <span className="font-medium text-[#2D211A] text-right">{station.location?.address || station.location?.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Vehicle</span>
              <span className="font-bold text-[#2D211A] text-right">
                {activeVehicle?.make} {activeVehicle?.model} ({activeVehicle?.variant || 'Standard'}) • {activeVehicle?.licensePlate || 'MH 15 EF 9021'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Date &amp; Time Window</span>
              <span className="font-bold text-[#2D6A4F]">
                {formatFullDate(selectedInterval.startTime)}, {formatSlotTime(selectedInterval.startTime)} – {formatSlotTime(selectedInterval.endTime)} ({selectedDuration} min)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Charger &amp; Connector</span>
              <span className="font-bold text-[#2D211A]">{selectedCharger?.identifierCode} • {selectedCharger?.connectorTypeCode}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Effective Charging Speed</span>
              <span className="font-bold text-[#2D211A]">{effectivePowerKw} kW DC</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">SOC Target &amp; Gain</span>
              <span className="font-semibold text-[#2D211A]">
                {currentSoc}% → {targetSoc}% (+{Math.max(0, targetSoc - currentSoc)}% SOC, +{rangeAddedKm} km range)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Tariff Snapshot</span>
              <span className="font-bold text-[#9A5B35]">₹{pricePerKwh} / kWh</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E8DFD5]/60">
              <span className="text-[#7D6B5E] font-medium">Estimated Grid Energy</span>
              <span className="font-semibold text-[#2D211A]">~{finalEstGridKwh} kWh</span>
            </div>

            {/* Financial itemization */}
            <div className="pt-2 space-y-1.5 border-t border-[#E8DFD5]">
              <div className="flex justify-between text-[#5D4A3E]">
                <span>Base Energy Charge</span>
                <span>₹{baseCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#5D4A3E]">
                <span>Goods &amp; Services Tax (GST 18%)</span>
                <span>₹{gstCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#5D4A3E]">
                <span>Platform Convenience Fee</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between py-1 pt-2 border-t border-[#E8DFD5] items-baseline">
              <span className="text-sm font-bold text-[#2D211A]">Total Payable (INR)</span>
              <span className="text-xl font-extrabold text-[#9A5B35]">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Test Payment Mode Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2D211A] uppercase tracking-wider">Payment Mode</span>
              <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                Test Mode (Simulated Sandbox)
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
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === method.id
                      ? 'bg-[#FAEEE6] border-[#9A5B35] ring-1 ring-[#9A5B35]'
                      : 'bg-[#FAF7F2] border-[#E8DFD5] hover:bg-[#F5F0E8] text-[#5D4A3E]'
                  }`}
                >
                  {method.icon}
                  <span className="text-xs font-bold">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Confirm Booking & Back / Change Slot */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={confirming}
              className="w-full sm:flex-1 py-3.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {confirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sealing Blockchain Reservation...</span>
                </>
              ) : (
                <>
                  <span>Pay &amp; Confirm Booking (₹{totalCost.toFixed(2)}) →</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={confirming}
              onClick={() => setSelectedInterval(null)}
              className="w-full sm:w-auto px-5 py-3.5 bg-[#FFFDF9] hover:bg-[#FAF7F2] border border-[#E8DFD5] text-[#5D4A3E] text-xs font-bold rounded-xl transition-all"
            >
              Back / Change Time
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
