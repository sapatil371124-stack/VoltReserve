import React, { useState, useEffect } from 'react';
import {
  Car, BatteryCharging, Gauge, Zap, CheckCircle2,
  X, ChevronRight, Plus, Sliders, ArrowRight
} from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';
import { useNavigate } from 'react-router-dom';

export const VehicleStatusModal = () => {
  const {
    vehicles,
    activeVehicle,
    currentSoc,
    estimatedRange,
    updateBatteryStatus,
    selectVehicle,
    showConfirmModal,
    setShowConfirmModal,
    calculateRange
  } = useVehicle();

  const navigate = useNavigate();
  const [sliderSoc, setSliderSoc] = useState(currentSoc);
  const [tempRange, setTempRange] = useState(estimatedRange);

  useEffect(() => {
    setSliderSoc(currentSoc);
    setTempRange(estimatedRange);
  }, [currentSoc, estimatedRange, showConfirmModal]);

  if (!showConfirmModal) return null;

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setSliderSoc(val);
    const newRange = calculateRange(activeVehicle, val);
    setTempRange(newRange);
  };

  const handleSaveAndConfirm = () => {
    updateBatteryStatus(sliderSoc, tempRange);
    setShowConfirmModal(false);
  };

  const handleSameAsLastTime = () => {
    updateBatteryStatus(currentSoc, estimatedRange);
    setShowConfirmModal(false);
  };

  const handleSelectDifferentVehicle = (veh) => {
    selectVehicle(veh);
    const s = Number(veh.currentSocPercentage) || 25;
    setSliderSoc(s);
    setTempRange(calculateRange(veh, s));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] shadow-warm-xl overflow-hidden text-[#2D211A] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAEEE6] border border-[#E8B89C] flex items-center justify-center text-[#9A5B35]">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D211A]">Confirm Vehicle &amp; Battery Status</h3>
              <p className="text-xs text-[#7D6B5E]">Ensure accurate station compatibility and range calculations</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfirmModal(false)}
            className="w-8 h-8 rounded-full hover:bg-[#E8DFD5]/60 flex items-center justify-center text-[#7D6B5E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Vehicle Card */}
          <div className="p-4 rounded-2xl bg-[#F5F0E8] border border-[#E8DFD5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A5B35]">Active Vehicle Profile</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FFFDF9] border border-[#E8DFD5] text-[10px] font-extrabold text-[#7D6B5E] uppercase">
                {activeVehicle?.vehicleType || 'CAR'}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#2D211A]">
                  {activeVehicle?.make} {activeVehicle?.model}
                </h4>
                <p className="text-xs text-[#7D6B5E] font-medium">
                  {activeVehicle?.variant || 'Standard'} • <span className="font-mono text-[#2D211A] font-semibold">{activeVehicle?.licensePlate || 'MH 15 EF 9021'}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#9A5B35]">{activeVehicle?.batteryCapacityKwh || 40.5} kWh</span>
                <p className="text-[10px] text-[#7D6B5E]">Battery Pack</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8DFD5]/70 text-[11px]">
              <div className="flex items-center space-x-1.5 text-[#5D4A3E]">
                <Zap className="w-3.5 h-3.5 text-[#9A5B35]" />
                <span>Max Charging: <strong>{activeVehicle?.maxChargingRateKw || 50} kW</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-[#5D4A3E]">
                <Car className="w-3.5 h-3.5 text-[#9A5B35]" />
                <span>Port: <strong>{activeVehicle?.connectorTypeCode || 'CCS2'}</strong></span>
              </div>
            </div>
          </div>

          {/* Multiple Vehicles Switcher */}
          {vehicles && vehicles.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5D4A3E] block">Switch Vehicle:</label>
              <div className="grid grid-cols-2 gap-2">
                {vehicles.map((v) => (
                  <button
                    key={v.id || v.licensePlate}
                    type="button"
                    onClick={() => handleSelectDifferentVehicle(v)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      activeVehicle?.id === v.id
                        ? 'bg-[#FAEEE6] border-[#9A5B35] text-[#2D211A] font-bold shadow-warm-xs'
                        : 'bg-[#FFFDF9] border-[#E8DFD5] text-[#7D6B5E] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="font-bold truncate">{v.make} {v.model}</div>
                    <div className="text-[10px] text-[#8B786A]">{v.batteryCapacityKwh} kWh • {v.connectorTypeCode || 'CCS2'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Battery Status Slider */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-[#9A5B35]" />
                <span className="text-xs font-bold text-[#2D211A] uppercase tracking-wide">Current Battery Level</span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-[#9A5B35]">{sliderSoc}%</span>
                <span className="text-xs font-bold text-[#7D6B5E]">SOC</span>
              </div>
            </div>

            {/* Slider Track */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sliderSoc}
                onChange={handleSliderChange}
                className="w-full h-3 bg-[#E8DFD5] rounded-lg appearance-none cursor-pointer accent-[#9A5B35] transition-all"
              />
              <div className="flex justify-between text-[10px] font-semibold text-[#8B786A]">
                <span>0% (Empty)</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Range & Gained Metric Preview */}
            <div className="p-3.5 rounded-2xl bg-[#FAEEE6]/70 border border-[#E8B89C]/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A5B35]">Estimated Usable Range</span>
                <p className="text-xs text-[#7D6B5E]">Based on vehicle consumption efficiency</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-[#2D211A]">~{tempRange}</span>
                <span className="text-xs font-bold text-[#9A5B35] ml-1">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-4 border-t border-[#E8DFD5] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSameAsLastTime}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D5C7B8] text-xs font-bold text-[#5D4A3E] hover:bg-[#E8DFD5]/40 transition-colors"
          >
            Same as last time ({currentSoc}%)
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowConfirmModal(false);
                navigate('/vehicles');
              }}
              className="px-3 py-2.5 rounded-xl text-xs font-bold text-[#9A5B35] hover:bg-[#FAEEE6] transition-colors"
            >
              Manage Vehicles
            </button>
            <button
              type="button"
              onClick={handleSaveAndConfirm}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#9A5B35] hover:bg-[#844A29] text-white text-xs font-bold shadow-warm-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Confirm &amp; Proceed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
