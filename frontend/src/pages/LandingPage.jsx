import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, ShieldCheck, MapPin, Calendar, Clock, ArrowRight,
  CheckCircle2, ChevronRight, Sparkles, Navigation, Shield, Database,
  Activity, BatteryCharging, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Opening3DIntro } from '../components/Opening3DIntro';

export const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Subtle 3D opening intro: only runs once per browser session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('vr_intro_shown');
  });

  const handleFinishIntro = () => {
    sessionStorage.setItem('vr_intro_shown', 'true');
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2D211A] font-sans selection:bg-[#9A5B35] selection:text-white">
      {/* 3D Opening Intro Overlay */}
      {showIntro && <Opening3DIntro onFinish={handleFinishIntro} />}

      {/* Studio Lighting Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#FFFDF9]/60 via-[#EFE7DC]/40 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-[#D59A6A]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Commercial EV Mobility Headline & Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="flex items-center space-x-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#E8DFD5] text-[#9A5B35] text-xs font-semibold tracking-wide shadow-warm-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#D59A6A]" />
                  <span className="uppercase">Smart EV Mobility • India</span>
                </div>
                <button
                  onClick={handleReplayIntro}
                  title="Replay 3D opening animation"
                  className="px-2.5 py-1 rounded-full bg-[#FAF7F2] hover:bg-[#EFE7DC] border border-[#E8DFD5] text-[#7D6B5E] text-[11px] font-medium flex items-center space-x-1 transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-current text-[#9A5B35]" />
                  <span>3D Intro</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#9A5B35] block">
                  VoltReserve Platform
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2D211A] leading-[1.08]">
                  Find a charger.<br />
                  Reserve your time.<br />
                  <span className="text-[#9A5B35]">Keep moving.</span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#5D4A3E] font-normal leading-relaxed max-w-xl">
                Find nearby charging stations, compare availability and reserve before you arrive. Guaranteed slot access with mathematical double-booking prevention, real GPS road routing, and cryptographic audit trails.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/stations"
                  className="px-6 py-3 rounded-xl bg-[#9A5B35] hover:bg-[#844A29] text-white font-semibold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>Find a Station</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/stations"
                  className="px-6 py-3 rounded-xl bg-[#FFFDF9] hover:bg-[#EFE7DC] border border-[#E8DFD5] text-[#2D211A] font-semibold text-sm shadow-warm-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-4 h-4 text-[#9A5B35]" />
                  <span>Explore Navigation Map</span>
                </Link>
              </div>

              {/* Guarantees */}
              <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[#7D6B5E]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Strict Concurrency Lock</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Transparent INR (₹) Pricing</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>SHA-256 Blockchain Audit</span>
                </div>
              </div>
            </div>

            {/* Right Column: Studio-Lit EV Visual & Telemetry */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* 3D Studio Pedestal Canvas */}
                <div className="relative rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#F8F1E7] border border-[#E8DFD5] p-6 lg:p-8 shadow-warm-xl overflow-hidden min-h-[440px] flex items-center justify-center">
                  
                  {/* Studio Lighting Gradients */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 inset-x-8 h-12 bg-[#2D211A]/10 blur-xl rounded-full pointer-events-none" />

                  {/* Clean Commercial EV Illustration */}
                  <div className="relative z-10 w-full flex flex-col items-center justify-center my-6">
                    <svg viewBox="0 0 520 280" className="w-full h-auto drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="carBodyWarm" x1="0" y1="0" x2="520" y2="280" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#4A3B32" />
                          <stop offset="35%" stopColor="#2D211A" />
                          <stop offset="70%" stopColor="#1E1611" />
                          <stop offset="100%" stopColor="#3E2E25" />
                        </linearGradient>
                        <linearGradient id="bodyHighlight" x1="120" y1="40" x2="380" y2="160" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                          <stop offset="50%" stopColor="#D59A6A" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="glassRoof" x1="160" y1="50" x2="340" y2="130" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#2A3439" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#12181B" stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id="rimWarm" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#E8DFD5" />
                          <stop offset="50%" stopColor="#A69588" />
                          <stop offset="100%" stopColor="#5D4A3E" />
                        </linearGradient>
                      </defs>

                      {/* Studio Pedestal Ellipse */}
                      <ellipse cx="260" cy="245" rx="230" ry="24" fill="#E8DFD5" fillOpacity="0.6" />
                      <ellipse cx="260" cy="245" rx="180" ry="16" fill="#D4C2AB" fillOpacity="0.4" />

                      {/* Ground Contact Shadows under Wheels */}
                      <ellipse cx="145" cy="240" rx="36" ry="10" fill="#1A130E" fillOpacity="0.55" />
                      <ellipse cx="385" cy="240" rx="36" ry="10" fill="#1A130E" fillOpacity="0.55" />

                      {/* EV Body Shell */}
                      <path d="M 45 190 Q 55 178 85 176 L 125 176 Q 165 145 220 95 Q 260 90 350 94 Q 405 130 455 168 L 478 178 Q 495 186 492 205 L 472 215 L 430 216 Q 425 185 385 185 Q 345 185 340 216 L 190 216 Q 185 185 145 185 Q 105 185 100 216 L 45 216 Z" fill="url(#carBodyWarm)" />
                      <path d="M 85 176 L 125 176 Q 165 145 220 95 Q 260 90 350 94 Q 405 130 455 168" stroke="url(#bodyHighlight)" strokeWidth="3" fill="none" />

                      {/* Sleek Aerodynamic Cabin Glass */}
                      <path d="M 215 102 L 345 102 Q 395 136 438 168 L 155 168 Q 180 135 215 102 Z" fill="url(#glassRoof)" stroke="#2D211A" strokeWidth="2" />
                      <line x1="285" y1="94" x2="288" y2="168" stroke="#4A3B32" strokeWidth="2" />

                      {/* Headlight & Tail Light */}
                      <path d="M 465 172 Q 482 178 488 184" stroke="#FFFDF9" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="488" cy="184" r="3.5" fill="#FFFDF9" />
                      <path d="M 52 190 Q 60 186 70 185" stroke="#9A5B35" strokeWidth="3" strokeLinecap="round" />

                      {/* Front Wheel */}
                      <g transform="translate(385, 218)">
                        <circle cx="0" cy="0" r="32" fill="#1C1815" stroke="#332A24" strokeWidth="3" />
                        <circle cx="0" cy="0" r="23" fill="url(#rimWarm)" />
                        <circle cx="0" cy="0" r="8" fill="#1C1815" />
                        <line x1="-18" y1="0" x2="18" y2="0" stroke="#FFFDF9" strokeWidth="1.5" strokeOpacity="0.7" />
                        <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFFDF9" strokeWidth="1.5" strokeOpacity="0.7" />
                      </g>

                      {/* Rear Wheel */}
                      <g transform="translate(145, 218)">
                        <circle cx="0" cy="0" r="32" fill="#1C1815" stroke="#332A24" strokeWidth="3" />
                        <circle cx="0" cy="0" r="23" fill="url(#rimWarm)" />
                        <circle cx="0" cy="0" r="8" fill="#1C1815" />
                        <line x1="-18" y1="0" x2="18" y2="0" stroke="#FFFDF9" strokeWidth="1.5" strokeOpacity="0.7" />
                        <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFFDF9" strokeWidth="1.5" strokeOpacity="0.7" />
                      </g>

                      {/* Architectural EV Charger Totem */}
                      <g transform="translate(35, 80)">
                        <rect x="0" y="0" width="22" height="135" rx="6" fill="#EFE7DC" stroke="#D4C2AB" strokeWidth="1.5" />
                        <rect x="5" y="16" width="12" height="20" rx="3" fill="#2D211A" />
                        <circle cx="11" cy="26" r="2.5" fill="#2D6A4F" />
                        <path d="M 11 40 Q 24 75 18 115" stroke="#9A5B35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>

                  {/* Floating Panel 1: Live Availability */}
                  <div className="absolute top-6 left-6 glass-panel-floating rounded-2xl p-3.5 max-w-[210px] text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9A5B35] block">
                      Live Telemetry
                    </span>
                    <p className="text-base font-bold text-[#2D211A] leading-tight mt-0.5">
                      8 / 12 Chargers Active
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#7D6B5E] pt-1.5 border-t border-[#E8DFD5]">
                      <span>Next slot:</span>
                      <span className="font-bold text-[#2D6A4F]">Available Now</span>
                    </div>
                  </div>

                  {/* Floating Panel 2: Est Cost */}
                  <div className="absolute bottom-6 right-6 glass-panel-floating rounded-2xl p-3.5 max-w-[190px] text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D6B5E] block">
                      Tariff Estimate
                    </span>
                    <p className="text-xl font-extrabold text-[#9A5B35] leading-none mt-1">
                      ₹18.50<span className="text-xs text-[#7D6B5E] font-medium">/kWh</span>
                    </p>
                    <p className="text-[11px] text-[#5D4A3E] font-medium mt-1">
                      25 kWh · ~35 min fast charge
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Engineering Pillars */}
      <section className="py-16 bg-[#EFE7DC]/60 border-y border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-[#9A5B35]">Engineering Core</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D211A] mt-2 tracking-tight">
              Designed for Absolute Certainty
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6B5E] mt-2">
              Eliminating the unpredictability of EV road trips through deterministic concurrency controls and distributed cryptographic proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#E8DFD5] shadow-warm-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAEEE6] text-[#9A5B35] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2D211A]">Advance Slot Reservation</h3>
              <p className="text-xs text-[#7D6B5E] leading-relaxed">
                Reserve your designated charging dispenser ahead of departure. A 10-minute temporary cart hold protects your booking window while you finalize trip telemetry.
              </p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#E8DFD5] shadow-warm-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F3ED] text-[#2D6A4F] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2D211A]">Zero Double-Booking</h3>
              <p className="text-xs text-[#7D6B5E] leading-relaxed">
                Row-level database write locks guarantee single-occupant slot ownership. Distance never overrides an already confirmed slot. First confirmed booking is authoritative.
              </p>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#E8DFD5] shadow-warm-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#2D211A]">SHA-256 Blockchain Ledger</h3>
              <p className="text-xs text-[#7D6B5E] leading-relaxed">
                Every reservation receipt is cryptographically sealed onto an immutable SHA-256 block sequence. Any manual tampering with session amounts or records is instantly flagged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Journey Lifecycle */}
      <section className="py-16 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#9A5B35]">The Seamless Flow</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D211A] mt-1 tracking-tight">
                Find → Compare → Reserve → Navigate → Charge → Pay
              </h2>
            </div>
            <Link
              to="/stations"
              className="mt-3 md:mt-0 inline-flex items-center text-xs font-bold text-[#9A5B35] hover:text-[#844A29]"
            >
              <span>Explore All Charging Stations</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: '01', title: 'Find', desc: 'Locate chargers across 6 Maharashtra cities with live filters.' },
              { step: '02', title: 'Compare', desc: 'Side-by-side comparison of power kW, connector types and tariffs.' },
              { step: '03', title: 'Reserve', desc: 'Secure an advance slot with zero risk of slot collision.' },
              { step: '04', title: 'Navigate', desc: 'Real GPS road trajectory and accurate driving duration.' },
              { step: '05', title: 'Charge', desc: 'Plug in and manage your dispenser session in real-time.' },
              { step: '06', title: 'Pay', desc: 'Itemized INR billing with UPI, card and transparent receipts.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#FFFDF9] p-4 rounded-xl border border-[#E8DFD5] shadow-warm-sm space-y-1.5">
                <span className="text-lg font-bold text-[#9A5B35] block">{item.step}</span>
                <h4 className="text-sm font-bold text-[#2D211A]">{item.title}</h4>
                <p className="text-[11px] text-[#7D6B5E] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1-Click Fast Access Login Bar */}
      <section className="py-10 bg-[#FFFDF9] border-t border-[#E8DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-warm-sm">
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAEEE6] text-[#9A5B35] uppercase tracking-wider mb-1.5">
                Instant Access
              </span>
              <h3 className="text-lg font-bold text-[#2D211A]">Access Accounts in One Click</h3>
              <p className="text-xs text-[#7D6B5E] mt-0.5 max-w-lg">
                Log in immediately as a registered EV driver or as a station administrator to verify reservation and ledger controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleQuickLogin('rahul.sharma@example.com', 'password123')}
                className="px-4 py-2 bg-[#FFFDF9] hover:bg-[#F5F0E8] border border-[#E8DFD5] text-[#2D211A] text-xs font-semibold rounded-xl shadow-warm-sm transition-all"
              >
                Log In as Driver (Rahul)
              </button>
              <button
                onClick={() => handleQuickLogin('admin@voltreserve.com', 'admin123')}
                className="px-4 py-2 bg-[#2D211A] hover:bg-[#1E1611] text-white text-xs font-semibold rounded-xl shadow-warm-sm transition-all"
              >
                Log In as Admin Hub
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
