import React, { useState, useEffect } from 'react';
import { Zap, MapPin, Sparkles, Navigation, BatteryCharging, ArrowRight, ShieldCheck, Car, RefreshCw } from 'lucide-react';
import { stationService, vehicleService } from '../services/api';
import { StationCard } from '../components/StationCard';
import { useAuth } from '../context/AuthContext';

export const RecommendationsPage = () => {
  const { isAuthenticated } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [minPower, setMinPower] = useState('60');
  const [userCoords, setUserCoords] = useState({ lat: 19.997453, lon: 73.789803 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => console.log("Using default Maharashtra coordinates")
      );
    }

    if (isAuthenticated) {
      vehicleService.getMyVehicles()
        .then((res) => {
          setVehicles(res);
          if (res.length > 0) setSelectedVehicleId(res[0].id);
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const fetchRecommendations = () => {
    setLoading(true);
    const params = {
      userLat: userCoords.lat,
      userLon: userCoords.lon,
      vehicleId: selectedVehicleId || undefined,
      minPowerKw: minPower ? Number(minPower) : undefined
    };

    stationService.getRecommendations(params)
      .then(setRecommendations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedVehicleId, minPower, userCoords]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F5F0E8] min-h-screen">
      {/* Header */}
      <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD5] shadow-warm-sm space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAEEE6] text-[#9A5B35] text-xs font-bold border border-[#E8B89C]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Criteria Recommendation Algorithm</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2D211A]">Smart Station Recommender</h1>
        <p className="text-xs sm:text-sm text-[#7D6B5E] leading-relaxed max-w-2xl">
          Ranked using a weighted multi-criteria decision formula combining physical proximity (40%), current charger availability (25%), peak charging speed (20%), and user reviews (15%).
        </p>
      </div>

      {/* Recommender Preferences Bar */}
      <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {vehicles.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-[#5D4A3E] flex items-center">
                <Car className="w-3.5 h-3.5 mr-1 text-[#9A5B35]" /> Compatible for:
              </span>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
              >
                <option value="">Any Vehicle Connector</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.connectorTypeCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-[#5D4A3E] flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-[#9A5B35]" /> Minimum Speed:
            </span>
            <select
              value={minPower}
              onChange={(e) => setMinPower(e.target.value)}
              className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
            >
              <option value="30">30 kW+ Standard</option>
              <option value="60">60 kW+ Rapid</option>
              <option value="120">120 kW+ Ultra-Fast</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F5F0E8] text-[#2D211A] border border-[#E8DFD5] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-warm-sm self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#9A5B35]" />
          <span>Recalculate Ranking</span>
        </button>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7D6B5E] font-medium">Computing multi-criteria rank vector...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-12 border border-[#E8DFD5] text-center space-y-3 shadow-warm-sm">
          <Sparkles className="w-10 h-10 text-[#A69588] mx-auto" />
          <h3 className="text-base font-bold text-[#2D211A]">No Optimal Matches Found</h3>
          <p className="text-xs text-[#7D6B5E]">Try relaxing your minimum charging speed criteria or selecting guest EV mode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="relative flex flex-col">
              <div className="absolute -top-3 left-5 z-20">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-warm-sm ${
                  index === 0
                    ? 'bg-[#9A5B35] text-white'
                    : 'bg-[#FFFDF9] text-[#5D4A3E] border border-[#E8DFD5]'
                }`}>
                  #{index + 1} {index === 0 ? 'Top Recommended Match' : 'Smart Pick'}
                </span>
              </div>
              <div className="pt-2 flex-1 flex flex-col">
                <StationCard station={rec} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
