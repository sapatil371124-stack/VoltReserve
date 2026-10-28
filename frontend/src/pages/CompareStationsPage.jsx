import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { GitCompare, Zap, CheckCircle2, XCircle, ArrowRight, MapPin, DollarSign, Clock, BatteryCharging } from 'lucide-react';
import { stationService } from '../services/api';

export const CompareStationsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get('ids');

  useEffect(() => {
    stationService.getStations()
      .then((data) => {
        setAllStations(data);
        const ids = idsParam ? idsParam.split(',').map(Number) : (data.slice(0, 2).map(s => s.id));
        return stationService.compareStations(ids);
      })
      .then(setStations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [idsParam]);

  const handleAddStationToCompare = (idToAdd) => {
    const currentIds = stations.map(s => s.id);
    if (!currentIds.includes(Number(idToAdd))) {
      const newIds = [...currentIds, Number(idToAdd)].slice(0, 3);
      navigate(`/compare?ids=${newIds.join(',')}`);
    }
  };

  const handleRemoveStation = (idToRemove) => {
    const newIds = stations.map(s => s.id).filter(id => id !== idToRemove);
    navigate(`/compare?ids=${newIds.join(',')}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#F5F0E8]">
        <div className="w-10 h-10 border-3 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#7D6B5E] font-medium">Comparing EV infrastructure metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F5F0E8] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#9A5B35]">Multi-Hub Benchmarking</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D211A] mt-1">Compare Charging Stations</h1>
          <p className="text-xs sm:text-sm text-[#7D6B5E] mt-1">
            Side-by-side analysis of charging speeds, power dispensers, tariffs, and amenities.
          </p>
        </div>

        {stations.length < 3 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#5D4A3E]">Add station:</span>
            <select
              onChange={(e) => e.target.value && handleAddStationToCompare(e.target.value)}
              defaultValue=""
              className="px-3 py-2 bg-[#FFFDF9] border border-[#E8DFD5] rounded-xl text-xs font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35] shadow-warm-sm"
            >
              <option value="" disabled>Select station to add...</option>
              {allStations
                .filter(s => !stations.some(st => st.id === s.id))
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.location?.cityName})</option>
                ))}
            </select>
          </div>
        )}
      </div>

      {stations.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] shadow-warm-sm">
          <GitCompare className="w-10 h-10 text-[#A69588] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#2D211A]">No Stations Selected for Comparison</h3>
          <p className="text-xs text-[#7D6B5E] mt-1">Select at least 2 charging stations to compare.</p>
          <Link to="/stations" className="mt-4 inline-block px-5 py-2.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm">
            Browse Stations
          </Link>
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] shadow-warm-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8DFD5] bg-[#FAF7F2]">
                <th className="p-5 font-bold text-[#8B786A] uppercase tracking-wider w-1/4">Metric</th>
                {stations.map((stn) => (
                  <th key={stn.id} className="p-5 font-bold text-[#2D211A] w-1/4 min-w-[220px]">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] uppercase block mb-1.5 w-fit">
                          {stn.location?.cityName}
                        </span>
                        <h4 className="text-base font-bold leading-tight">{stn.name}</h4>
                        <p className="text-[11px] text-[#7D6B5E] font-normal mt-0.5">{stn.location?.name}</p>
                      </div>
                      {stations.length > 1 && (
                        <button
                          onClick={() => handleRemoveStation(stn.id)}
                          className="text-[#8B786A] hover:text-[#9E3B3B] p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFD5]">
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Max Charging Speed</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5 font-bold text-sm text-[#2D6A4F]">{s.maxPowerKw} kW DC</td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Available Dispensers</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5 font-bold text-[#2D211A]">{s.availableChargersCount} of {s.totalChargersCount} Guns Active</td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Base Tariff</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5 font-bold text-sm text-[#9A5B35]">₹{s.minPricePerKwh} / kWh</td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Est. Cost (25 kWh)</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5 font-bold text-[#2D211A]">₹{s.estimatedCost} (~{s.estimatedChargingMinutes} min)</td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Supported Connectors</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {s.supportedConnectors?.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5D4A3E] border border-[#E8DFD5] text-[10px] font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Operating Hours</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5 text-[#7D6B5E]">{s.operatingHours}</td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Amenities</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5 text-[#7D6B5E] text-[11px]">{s.amenities || 'WiFi, Restrooms'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-5 font-bold text-[#5D4A3E]">Action</td>
                {stations.map(s => (
                  <td key={s.id} className="p-5">
                    <Link
                      to={`/stations/${s.id}`}
                      className="inline-flex items-center space-x-1 px-4 py-2 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm transition-all"
                    >
                      <span>Reserve Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
