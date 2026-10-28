import React from 'react';
import { Clock, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

export const SlotSelector = ({ slots, selectedSlotId, onSelectSlot, loading }) => {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#7D6B5E] font-medium">Loading available charging slots...</p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5]">
        <Clock className="w-8 h-8 text-[#A69588] mx-auto mb-2" />
        <h4 className="text-sm font-bold text-[#2D211A]">No Slots Available</h4>
        <p className="text-xs text-[#7D6B5E] mt-1">There are no operational slots scheduled for this charger on the selected date.</p>
      </div>
    );
  }

  const formatSlotTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#2D211A]">Available Slots</h4>
        <div className="flex items-center space-x-3 text-xs text-[#7D6B5E]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]"></span>
            <span>Available</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A69588]"></span>
            <span>FULL</span>
          </span>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {slots.map((slot) => {
          const status = slot.status ? slot.status.toUpperCase() : 'AVAILABLE';
          const isAvailable = status === 'AVAILABLE' || (status === 'HELD' && slot.isHeldByCurrentUser);
          const isSelected = selectedSlotId === slot.id;
          const timeText = `${formatSlotTime(slot.startTime)} – ${formatSlotTime(slot.endTime)}`;

          if (!isAvailable) {
            return (
              <div
                key={slot.id}
                className="p-3 rounded-xl border border-[#E8DFD5]/70 bg-[#F5F0E8]/50 text-center opacity-60 cursor-not-allowed select-none"
                title="This slot is already booked"
              >
                <div className="text-xs font-semibold text-[#8B786A]">{timeText}</div>
                <div className="text-[10px] font-extrabold text-[#9E3B3B] uppercase tracking-wider mt-1">
                  FULL
                </div>
              </div>
            );
          }

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-[#FAEEE6] border-[#9A5B35] ring-2 ring-[#9A5B35]/25 shadow-warm-sm scale-[1.02]'
                  : 'bg-[#FFFDF9] border-[#E8DFD5] hover:border-[#9A5B35] hover:bg-[#FAF7F2] text-[#2D211A] shadow-warm-xs'
              }`}
            >
              <div className="text-xs font-bold text-[#2D211A]">{timeText}</div>
              <div className="text-[10px] font-semibold text-[#2D6A4F] mt-1 flex items-center justify-center space-x-1">
                {isSelected && <CheckCircle2 className="w-3 h-3 text-[#9A5B35]" />}
                <span className={isSelected ? 'text-[#9A5B35] font-bold' : ''}>
                  {isSelected ? 'Selected' : 'Available'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
