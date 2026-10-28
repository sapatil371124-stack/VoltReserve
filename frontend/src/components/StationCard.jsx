import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Clock, BatteryCharging, ArrowRight, Navigation, GitCompare, Sparkles } from 'lucide-react';

export const StationCard = ({ station, onCompareToggle, isCompared = false, isSelected = false, onNavigate }) => {
  const navigate = useNavigate();

  return (
    <div
      id={`station-card-${station.id}`}
      className={`rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative font-sans ${
        isSelected
          ? 'bg-[#FFFDF9] border-2 border-[#9A5B35] ring-4 ring-[#9A5B35]/20 shadow-warm-xl scale-[1.01]'
          : 'bg-[#FFFDF9] border border-[#E8DFD5] shadow-warm-sm hover:shadow-warm-lg hover:border-[#D59A6A]'
      }`}
    >
      {/* Station Content */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C]">
                {station.location?.cityName || 'Maharashtra'}
              </span>
              <span className="text-xs font-semibold text-[#8B786A] flex items-center">
                ★ {station.rating ? Number(station.rating).toFixed(1) : '4.8'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#2D211A] group-hover:text-[#9A5B35] transition-colors mt-2 leading-snug truncate" title={station.name}>
              {station.name}
            </h3>
            <p className="text-xs text-[#7D6B5E] flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#A69588] shrink-0" />
              <span className="truncate">{station.location?.address || station.location?.name}</span>
            </p>
          </div>

          {/* Distance Badge */}
          {station.distanceKm != null && (
            <div className="bg-[#F5F0E8] px-3 py-1.5 rounded-xl text-center shrink-0 border border-[#E8DFD5]">
              <span className="text-xs font-bold text-[#9A5B35] block leading-none">
                {Number(station.distanceKm).toFixed(1)} km
              </span>
              <span className="text-[10px] text-[#7D6B5E] font-medium mt-0.5 block">
                ~{station.estimatedTravelMinutes || 12} min
              </span>
            </div>
          )}
        </div>

        {/* Charger & Power Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-[#E8DFD5]">
          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD5] flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAEEE6] text-[#9A5B35] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Speed</span>
              <span className="text-xs font-bold text-[#2D211A]">{station.maxPowerKw || 120} kW DC</span>
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD5] flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F3ED] text-[#2D6A4F] flex items-center justify-center shrink-0">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Availability</span>
              <span className="text-xs font-bold text-[#2D6A4F]">
                {station.availableChargersCount} / {station.totalChargersCount} Guns
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Estimation Breakdown */}
        <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 bg-[#F5F0E8] rounded-xl border border-[#E8DFD5]">
          <div>
            <span className="text-[#7D6B5E] font-medium">Tariff: </span>
            <span className="font-bold text-[#9A5B35]">₹{station.minPricePerKwh}/kWh</span>
          </div>
          <div className="text-right">
            <span className="text-[#7D6B5E] font-medium">Est. 25 kWh: </span>
            <span className="font-bold text-[#2D211A]">₹{station.estimatedCost}</span>
          </div>
        </div>

        {/* Connectors & Operating Hours */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          {station.supportedConnectors?.map((conn, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF7F2] text-[#5D4A3E] border border-[#E8DFD5]"
            >
              {conn}
            </span>
          ))}
          {station.operatingHours && (
            <span className="text-[10px] text-[#8B786A] font-medium flex items-center ml-auto">
              <Clock className="w-3 h-3 mr-1 text-[#A69588]" />
              {station.operatingHours}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E8DFD5] flex items-center space-x-2">
        <button
          onClick={() => navigate(`/stations/${station.id}`)}
          className="flex-1 py-2 px-3 bg-[#9A5B35] hover:bg-[#844A29] text-white text-xs font-semibold rounded-xl shadow-warm-sm flex items-center justify-center space-x-1.5 transition-all"
        >
          <span>Reserve Slot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onNavigate && (
          <button
            onClick={() => onNavigate(station)}
            title="Calculate and display route on map"
            className="py-2 px-3.5 bg-[#FFFDF9] hover:bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B99D] hover:border-[#9A5B35] rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-warm-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Route</span>
          </button>
        )}

        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(station.id)}
            title={isCompared ? "Remove from Comparison" : "Add to Comparison"}
            className={`p-2 rounded-xl border transition-all shadow-warm-sm ${
              isCompared
                ? 'bg-[#FAEEE6] border-[#E8B89C] text-[#9A5B35]'
                : 'bg-[#FFFDF9] border-[#E8DFD5] text-[#7D6B5E] hover:text-[#2D211A] hover:bg-[#F5F0E8]'
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
