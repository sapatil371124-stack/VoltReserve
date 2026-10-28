import React from 'react';
import { Zap, ShieldCheck, Database, Navigation, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#EFE7DC] text-[#5D4A3E] border-t border-[#E8DFD5] mt-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#9A5B35] flex items-center justify-center text-white shadow-warm-sm">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#2D211A]">
                Volt<span className="text-[#9A5B35]">Reserve</span>
              </span>
            </div>
            <p className="text-sm text-[#7D6B5E] max-w-md leading-relaxed">
              A smart EV mobility reservation and route optimization architecture. Designed to eliminate charging uncertainty with pessimistic concurrency locking, real-time availability sync, and tamper-evident SHA-256 blockchain audit logs.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FFFDF9] border border-[#E8DFD5] text-[#5D4A3E] shadow-warm-sm">
                <Database className="w-3.5 h-3.5 mr-1.5 text-[#9A5B35]" /> MySQL 8.0 Engine
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FFFDF9] border border-[#E8DFD5] text-[#5D4A3E] shadow-warm-sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#2D6A4F]" /> SHA-256 Blockchain
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FFFDF9] border border-[#E8DFD5] text-[#5D4A3E] shadow-warm-sm">
                <Navigation className="w-3.5 h-3.5 mr-1.5 text-[#D59A6A]" /> Leaflet + OpenStreetMap
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-sm font-bold text-[#2D211A] uppercase tracking-wider mb-4 border-b border-[#E8DFD5] pb-2">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-[#7D6B5E]">
              <li>
                <Link to="/stations" className="hover:text-[#9A5B35] transition-colors">Station Discovery</Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-[#9A5B35] transition-colors">Smart Recommender</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-[#9A5B35] transition-colors">Compare Hubs</Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-[#9A5B35] transition-colors">My Reservations</Link>
              </li>
              <li>
                <Link to="/vehicles" className="hover:text-[#9A5B35] transition-colors">Garage &amp; Connector Types</Link>
              </li>
            </ul>
          </div>

          {/* Concurrency & Safety */}
          <div>
            <h4 className="text-sm font-bold text-[#2D211A] uppercase tracking-wider mb-4 border-b border-[#E8DFD5] pb-2">
              System Guarantees
            </h4>
            <ul className="space-y-2.5 text-xs text-[#7D6B5E] leading-relaxed">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span><strong>Double-Booking Proof:</strong> Strict pessimistic database write locks guarantee single-occupant reservation slots.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span><strong>No Distance Bias:</strong> Proximity never displaces a confirmed booking. First confirmed booking is authoritative.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span><strong>Cryptographic Audit:</strong> Each session is chained into an immutable SHA-256 ledger.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8DFD5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B786A]">
          <p>© {new Date().getFullYear()} VoltReserve. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-medium">Find · Compare · Reserve · Navigate · Charge · Pay</p>
        </div>
      </div>
    </footer>
  );
};
