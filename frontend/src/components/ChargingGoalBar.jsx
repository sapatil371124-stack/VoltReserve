import React from 'react';
import {
  Car, BatteryCharging, Zap, Gauge, Sliders, ArrowRight,
  TrendingUp, Clock, Check
} from 'lucide-react';
import { useVehicle } from '../context/VehicleContext';

export const ChargingGoalBar = ({ compact = false, onGoalChanged = null }) => {
  const {
    activeVehicle,
    currentSoc,
    estimatedRange,
    targetSoc,
    setTargetSoc,
    chargingGoalMode,
    setChargingGoalMode,
    desiredKwh,
    setDesiredKwh,
    desiredDurationMinutes,
    setDesiredDurationMinutes,
    energyNeededBatteryKwh,
    energyNeededGridKwh,
    rangeAddedKm,
    setShowConfirmModal
  } = useVehicle();

  const percentagePresets = [50, 60, 70, 80, 90, 100];
  const energyPresets = [10, 15, 20, 25, 30];
  const durationPresets = [30, 45, 60, 90, 120];

  const handleSelectPercentage = (p) => {
    if (p <= currentSoc) return;
    setTargetSoc(p);
    if (onGoalChanged) onGoalChanged({ type: 'PERCENTAGE', value: p });
  };

  const handleSelectEnergy = (kwh) => {
    setDesiredKwh(kwh);
    const capacity = Number(activeVehicle?.batteryCapacityKwh) || 40.5;
    const gainedSoc = Math.round((kwh / capacity) * 100);
    const newTarget = Math.min(100, currentSoc + gainedSoc);
    setTargetSoc(newTarget);
    if (onGoalChanged) onGoalChanged({ type: 'ENERGY', value: kwh });
  };

  const handleSelectDuration = (mins) => {
    setDesiredDurationMinutes(mins);
    if (onGoalChanged) onGoalChanged({ type: 'DURATION', value: mins });
  };

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] shadow-warm-sm p-4 sm:p-5 space-y-4">
      {/* Top row: Active Vehicle and Battery Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD5]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAEEE6] border border-[#E8B89C] flex items-center justify-center text-[#9A5B35] shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#2D211A]">
                {activeVehicle?.make} {activeVehicle?.model}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#7D6B5E] border border-[#E8DFD5]">
                {activeVehicle?.connectorTypeCode || 'CCS2'}
              </span>
            </div>
            <p className="text-xs text-[#7D6B5E]">
              Battery: <strong className="text-[#2D211A]">{activeVehicle?.batteryCapacityKwh || 40.5} kWh</strong> • Max Rate: <strong className="text-[#2D211A]">{activeVehicle?.maxChargingRateKw || 50} kW</strong>
            </p>
          </div>
        </div>

        {/* Current SOC & Change Button */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <div className="text-right">
            <div className="flex items-center space-x-1.5 justify-end">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] animate-pulse"></span>
              <span className="text-sm font-extrabold text-[#2D211A]">{currentSoc}% SOC</span>
            </div>
            <p className="text-[11px] text-[#7D6B5E]">~{estimatedRange} km range</p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-3 py-1.5 rounded-xl border border-[#D5C7B8] hover:border-[#9A5B35] bg-[#FAF7F2] hover:bg-[#FAEEE6] text-[#9A5B35] text-xs font-bold transition-all flex items-center space-x-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Update Battery</span>
          </button>
        </div>
      </div>

      {/* Charging Goal Mode Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9A5B35] flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Charging Goal</span>
          </span>

          {/* Goal Mode Pills */}
          <div className="flex items-center bg-[#F5F0E8] p-1 rounded-xl border border-[#E8DFD5] text-xs">
            <button
              type="button"
              onClick={() => setChargingGoalMode('PERCENTAGE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chargingGoalMode === 'PERCENTAGE'
                  ? 'bg-[#FFFDF9] text-[#9A5B35] shadow-warm-xs'
                  : 'text-[#7D6B5E] hover:text-[#2D211A]'
              }`}
            >
              Target %
            </button>
            <button
              type="button"
              onClick={() => setChargingGoalMode('ENERGY')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chargingGoalMode === 'ENERGY'
                  ? 'bg-[#FFFDF9] text-[#9A5B35] shadow-warm-xs'
                  : 'text-[#7D6B5E] hover:text-[#2D211A]'
              }`}
            >
              Energy (kWh)
            </button>
            <button
              type="button"
              onClick={() => setChargingGoalMode('TIME')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chargingGoalMode === 'TIME'
                  ? 'bg-[#FFFDF9] text-[#9A5B35] shadow-warm-xs'
                  : 'text-[#7D6B5E] hover:text-[#2D211A]'
              }`}
            >
              Time Limit
            </button>
          </div>
        </div>

        {/* Goal Mode Options */}
        {chargingGoalMode === 'PERCENTAGE' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D6B5E]">
              <span>Select target charge level:</span>
              <span className="font-bold text-[#9A5B35]">{targetSoc}% Target</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {percentagePresets.map((p) => {
                const disabled = p <= currentSoc;
                const isSelected = targetSoc === p;
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectPercentage(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      disabled
                        ? 'opacity-40 border-[#E8DFD5] bg-[#F5F0E8] text-[#A69588] cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#FAEEE6] border-[#9A5B35] text-[#9A5B35] ring-1 ring-[#9A5B35] shadow-warm-xs'
                        : 'bg-[#FFFDF9] border-[#E8DFD5] text-[#2D211A] hover:border-[#9A5B35] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {p}%
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {chargingGoalMode === 'ENERGY' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D6B5E]">
              <span>Select desired energy to add:</span>
              <span className="font-bold text-[#9A5B35]">+{desiredKwh} kWh</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {energyPresets.map((kwh) => {
                const isSelected = desiredKwh === kwh;
                return (
                  <button
                    key={kwh}
                    type="button"
                    onClick={() => handleSelectEnergy(kwh)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-[#FAEEE6] border-[#9A5B35] text-[#9A5B35] ring-1 ring-[#9A5B35] shadow-warm-xs'
                        : 'bg-[#FFFDF9] border-[#E8DFD5] text-[#2D211A] hover:border-[#9A5B35] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    +{kwh} kWh
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {chargingGoalMode === 'TIME' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7D6B5E]">
              <span>Select reserved charging duration:</span>
              <span className="font-bold text-[#9A5B35]">{desiredDurationMinutes} Minutes</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {durationPresets.map((mins) => {
                const isSelected = desiredDurationMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSelectDuration(mins)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-[#FAEEE6] border-[#9A5B35] text-[#9A5B35] ring-1 ring-[#9A5B35] shadow-warm-xs'
                        : 'bg-[#FFFDF9] border-[#E8DFD5] text-[#2D211A] hover:border-[#9A5B35] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {mins} Min
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Calculated Gained Metrics Pill */}
        <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#7D6B5E]">State of Charge:</span>
            <span className="font-bold text-[#2D211A]">{currentSoc}% → {targetSoc}%</span>
            <span className="text-[11px] font-bold text-[#2D6A4F] bg-[#E8F3ED] px-1.5 py-0.5 rounded border border-[#B7DFCA]">
              +{Math.max(0, targetSoc - currentSoc)}%
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <span className="text-[#7D6B5E] mr-1.5">Energy:</span>
              <strong className="text-[#9A5B35]">~{energyNeededBatteryKwh} kWh</strong>
              <span className="text-[10px] text-[#8B786A] ml-1">({energyNeededGridKwh} kWh grid)</span>
            </div>
            <div>
              <span className="text-[#7D6B5E] mr-1.5">Range Gain:</span>
              <strong className="text-[#2D6A4F]">+{rangeAddedKm} km</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
