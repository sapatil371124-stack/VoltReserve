import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

export const FlexibleIntervalSelector = ({
  intervals,
  selectedInterval,
  onSelectInterval,
  durationMinutes,
  onChangeDuration,
  loading
}) => {
  const durationOptions = [30, 45, 60, 90, 120];

  return (
    <div className="space-y-4">
      {/* Duration selector tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#9A5B35]" />
          <h4 className="text-sm font-bold text-[#2D211A]">Reservation Duration</h4>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {durationOptions.map((dur) => (
            <button
              key={dur}
              type="button"
              onClick={() => onChangeDuration(dur)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                durationMinutes === dur
                  ? 'bg-[#9A5B35] text-white border-[#9A5B35] shadow-warm-xs'
                  : 'bg-[#FFFDF9] text-[#7D6B5E] border-[#E8DFD5] hover:bg-[#FAF7F2] hover:text-[#2D211A]'
              }`}
            >
              {dur} min
            </button>
          ))}
        </div>
      </div>

      {/* Available Start Times Header & Legend */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-[#7D6B5E]">
          Select Start Time ({durationMinutes} min window)
        </span>
        <div className="flex items-center space-x-3 text-[11px] text-[#7D6B5E]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]"></span>
            <span>Available</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A69588]"></span>
            <span>FULL / Booked</span>
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7D6B5E] font-medium">Checking live slot availability...</p>
        </div>
      ) : (!intervals || intervals.length === 0) ? (
        <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5]">
          <Clock className="w-8 h-8 text-[#A69588] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#2D211A]">No Operating Slots</h4>
          <p className="text-xs text-[#7D6B5E] mt-1">There are no operational windows available for this charger on the selected date.</p>
        </div>
      ) : (
        /* Interval Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {intervals.map((item, idx) => {
            const isSelected = selectedInterval &&
              selectedInterval.startTime === item.startTime &&
              selectedInterval.endTime === item.endTime;

            if (!item.available) {
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[#E8DFD5]/70 bg-[#F5F0E8]/50 text-center opacity-60 cursor-not-allowed select-none"
                  title="This time interval is already booked"
                >
                  <div className="text-xs font-semibold text-[#8B786A]">{item.timeLabel}</div>
                  <div className="text-[10px] font-extrabold text-[#9E3B3B] uppercase tracking-wider mt-1">
                    {item.conflictReason === 'PAST_TIME' ? 'PAST' : 'FULL'}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectInterval(item)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#FAEEE6] border-[#9A5B35] ring-2 ring-[#9A5B35]/25 shadow-warm-sm scale-[1.02]'
                    : 'bg-[#FFFDF9] border-[#E8DFD5] hover:border-[#9A5B35] hover:bg-[#FAF7F2] text-[#2D211A] shadow-warm-xs'
                }`}
              >
                <div className="text-xs font-bold text-[#2D211A]">{item.timeLabel}</div>
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
      )}
    </div>
  );
};
