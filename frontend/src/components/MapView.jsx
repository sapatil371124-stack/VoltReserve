import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  Navigation, Clock, Zap, MapPin, Compass, ArrowRight,
  ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Layers, CheckCircle2, RotateCcw
} from 'lucide-react';
import { routingService } from '../services/api';

// Fix Leaflet's default marker asset paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Station Pin (Terracotta Studio Minimalist)
const createStationIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-ev-station-pin',
    html: `
      <div style="
        background: ${isSelected ? 'linear-gradient(135deg, #9A5B35, #6E3A1D)' : '#FFFDF9'};
        color: ${isSelected ? '#FFFFFF' : '#9A5B35'};
        border: 2px solid ${isSelected ? '#FFFFFF' : '#9A5B35'};
        border-radius: 9999px;
        width: ${isSelected ? '40px' : '34px'};
        height: ${isSelected ? '40px' : '34px'};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected ? '0 10px 25px rgba(154, 91, 53, 0.5), 0 0 0 5px rgba(154, 91, 53, 0.25)' : '0 4px 14px rgba(45, 33, 26, 0.16)'};
        transform: translate(-50%, -50%);
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '20' : '17'}" height="${isSelected ? '20' : '17'}" viewBox="0 0 24 24" fill="${isSelected ? '#FFFFFF' : '#9A5B35'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [isSelected ? 40 : 34, isSelected ? 40 : 34],
    iconAnchor: [isSelected ? 20 : 17, isSelected ? 20 : 17],
    popupAnchor: [0, -20]
  });
};

// Current Location Marker with Radar Beacon
const userLocationIcon = L.divIcon({
  className: 'custom-user-gps-pin',
  html: `
    <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;transform:translate(-50%, -50%);">
      <div style="position:absolute;inset:0;background:rgba(154,91,53,0.3);border-radius:9999px;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="background:#2D211A;color:white;border:3px solid #FFFDF9;border-radius:9999px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(45,33,26,0.4);position:relative;z-index:2;">
        <div style="width:8px;height:8px;background:#D59A6A;border-radius:9999px;"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18]
});

// Component to dynamically fit map viewport bounds when bounds change
function FitBoundsHelper({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
}

// MarkerCluster component with VoltReserve theme
function StationClusterLayer({ stations, selectedStation, onSelectStation }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !stations) return;

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let sizePx = 36;
        let fontSize = '12px';
        if (count >= 50) {
          sizePx = 46;
          fontSize = '14px';
        } else if (count >= 15) {
          sizePx = 40;
          fontSize = '13px';
        }

        return L.divIcon({
          html: `
            <div style="
              width: ${sizePx}px;
              height: ${sizePx}px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #9A5B35 0%, #6E3A1D 100%);
              color: #FFFFFF;
              font-weight: 700;
              font-size: ${fontSize};
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid #FFFDF9;
              box-shadow: 0 6px 18px rgba(154, 91, 53, 0.45);
              font-family: 'Inter', sans-serif;
              letter-spacing: -0.3px;
            ">
              ${count}
            </div>
          `,
          className: 'custom-cluster-marker',
          iconSize: [sizePx, sizePx],
          iconAnchor: [sizePx / 2, sizePx / 2]
        });
      }
    });

    stations.forEach((stn) => {
      if (!stn.location) return;
      const lat = Number(stn.location.latitude);
      const lng = Number(stn.location.longitude);
      const isSelected = selectedStation && selectedStation.id === stn.id;

      const marker = L.marker([lat, lng], {
        icon: createStationIcon(isSelected)
      });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3.5 max-w-[260px] font-sans';
      popupDiv.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="padding:4px;border-radius:6px;background:#FAEEE6;color:#9A5B35;display:inline-flex;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </span>
          <h4 style="font-weight:700;font-size:13px;color:#2D211A;line-height:1.3;margin:0;">${stn.name}</h4>
        </div>
        <p style="font-size:11px;color:#7D6B5E;margin:0 0 8px 0;line-height:1.3;">${stn.location.address || ''}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #E8DFD5;padding-top:8px;font-size:12px;">
          <span style="font-weight:700;color:#9A5B35;">₹${stn.minPricePerKwh}/kWh</span>
          <span style="font-size:11px;font-weight:600;color:#2D6A4F;background:#E8F3ED;padding:2px 8px;border-radius:9999px;border:1px solid #B7DFCA;">
            ${stn.availableChargersCount || 0} Available
          </span>
        </div>
      `;

      if (onSelectStation) {
        const btn = document.createElement('button');
        btn.innerText = 'Route to Station';
        btn.style.cssText = 'width:100%;margin-top:10px;padding:7px 12px;background:#9A5B35;color:#fff;font-size:12px;font-weight:600;border-radius:8px;border:none;cursor:pointer;transition:background 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;';
        btn.onmouseover = () => { btn.style.background = '#844A29'; };
        btn.onmouseout = () => { btn.style.background = '#9A5B35'; };
        btn.onclick = (e) => {
          e.stopPropagation();
          onSelectStation(stn);
          marker.closePopup();
        };
        popupDiv.appendChild(btn);
      }

      marker.bindPopup(popupDiv, { maxWidth: 280 });
      marker.on('click', () => {
        if (onSelectStation) onSelectStation(stn);
      });

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, stations, selectedStation, onSelectStation]);

  return null;
}

export const MapView = ({
  stations = [],
  selectedStation = null,
  userLocation = { lat: 19.997453, lng: 73.789803 },
  onSelectStation,
  onClearRoute,
  showRoute = true,
  height = '500px'
}) => {
  const navigate = useNavigate();
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [showDirections, setShowDirections] = useState(false);

  // Reliable OpenStreetMap tile provider (no paid API key required)
  const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Calculate actual driving route when a station is selected
  useEffect(() => {
    if (selectedStation && selectedStation.location && userLocation && showRoute) {
      setRouteLoading(true);
      setRouteError(null);

      const req = {
        originLat: userLocation.lat,
        originLng: userLocation.lng,
        destinationLat: Number(selectedStation.location.latitude),
        destinationLng: Number(selectedStation.location.longitude),
        stationId: selectedStation.id
      };

      routingService.calculateRoute(req)
        .then((res) => {
          setRouteData(res);
          setRouteError(null);
        })
        .catch((err) => {
          console.error("Routing calculation error:", err);
          setRouteError("Unable to calculate road route. Please verify your location and try again.");
          setRouteData(null);
        })
        .finally(() => setRouteLoading(false));
    } else {
      setRouteData(null);
      setRouteError(null);
      setShowDirections(false);
    }
  }, [selectedStation, userLocation, showRoute]);

  // Compute map bounds to fit route coordinates or stations
  const boundsPoints = useMemo(() => {
    const points = [];
    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      routeData.coordinates.forEach(pt => points.push(pt));
    } else if (selectedStation && selectedStation.location) {
      points.push([Number(selectedStation.location.latitude), Number(selectedStation.location.longitude)]);
    } else if (stations && stations.length > 0) {
      stations.forEach(s => {
        if (s.location) points.push([Number(s.location.latitude), Number(s.location.longitude)]);
      });
    }
    return points.length > 0 ? points : [[19.997453, 73.789803]];
  }, [userLocation, selectedStation, routeData, stations]);

  const centerPosition = useMemo(() => {
    if (selectedStation && selectedStation.location) {
      return [Number(selectedStation.location.latitude), Number(selectedStation.location.longitude)];
    }
    return [userLocation.lat, userLocation.lng];
  }, [selectedStation, userLocation]);

  const handleClearRouteClick = () => {
    setRouteData(null);
    setRouteError(null);
    setShowDirections(false);
    if (onClearRoute) {
      onClearRoute();
    } else if (onSelectStation) {
      onSelectStation(null);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-warm-lg border border-[#E8DFD5] bg-[#FAF7F2]" style={{ height }}>
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          maxZoom={19}
        />

        <FitBoundsHelper bounds={boundsPoints} />

        {/* User Current Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-3 text-center font-sans">
                <span className="font-bold text-xs text-[#2D211A] block">Current Location</span>
                <span className="text-[11px] text-[#7D6B5E]">Departure Origin Point</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Clustered Station Markers */}
        <StationClusterLayer
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
        />

        {/* Real Road Polyline: Dark outer casing + vibrant terracotta road core */}
        {routeData && routeData.coordinates && routeData.coordinates.length > 0 && (
          <>
            {/* Outer casing */}
            <Polyline
              positions={routeData.coordinates}
              color="#582C15"
              weight={6}
              opacity={0.35}
              lineCap="round"
              lineJoin="round"
            />
            {/* Inner road route */}
            <Polyline
              positions={routeData.coordinates}
              color="#9A5B35"
              weight={4}
              opacity={0.95}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}
      </MapContainer>

      {/* Real Route Navigation Panel HUD */}
      {selectedStation && (
        <div className="absolute top-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-md z-[400] glass-warm-elevated rounded-2xl p-4 shadow-warm-xl border border-[#E8DFD5] max-h-[85%] overflow-y-auto font-sans">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD5]">
            <div className="flex-1 mr-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B99D]">
                  <Navigation className="w-3 h-3 mr-1" />
                  Route Navigation
                </span>
                {routeLoading && (
                  <span className="text-[10px] text-[#9A5B35] font-semibold animate-pulse flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9A5B35] animate-ping" />
                    <span>Calculating real road route...</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#2D211A] mt-1.5 leading-snug">
                {selectedStation.name}
              </h3>
            </div>

            <button
              onClick={handleClearRouteClick}
              title="Clear Route & Return to Browsing"
              className="text-xs text-[#7D6B5E] hover:text-[#2D211A] p-1.5 rounded-lg hover:bg-[#EFE7DC] transition-colors border border-transparent hover:border-[#E8DFD5]"
            >
              ✕
            </button>
          </div>

          {/* Error Message if route failed */}
          {routeError && (
            <div className="mt-3 p-3 rounded-xl bg-[#FFF3EE] border border-[#F2C4B0] text-xs text-[#844A29] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B87548] mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{routeError}</p>
                <button
                  onClick={() => {
                    setRouteError(null);
                    setRouteLoading(true);
                  }}
                  className="mt-1.5 text-xs font-bold text-[#9A5B35] underline"
                >
                  Retry Route
                </button>
              </div>
            </div>
          )}

          {/* Route Overview: Origin -> Destination Flow */}
          <div className="mt-3 py-2 px-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
            <div className="flex items-center space-x-2.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2D211A] border-2 border-[#D59A6A] shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-[10px] text-[#7D6B5E] uppercase font-bold block">Origin</span>
                <span className="font-semibold text-[#2D211A] truncate block">Your Current Location (GPS)</span>
              </div>
            </div>

            <div className="pl-1 text-[#9A5B35] text-xs flex items-center space-x-2">
              <div className="w-0.5 h-4 bg-[#D59A6A] ml-1" />
              <span className="text-[10px] text-[#8B786A] font-medium italic">
                {routeData?.summary || "Real road trajectory"}
              </span>
            </div>

            <div className="flex items-center space-x-2.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#9A5B35] border-2 border-white shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-[10px] text-[#7D6B5E] uppercase font-bold block">Destination</span>
                <span className="font-semibold text-[#2D211A] truncate block">
                  {selectedStation.location?.address || selectedStation.name}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Metrics */}
          {routeData && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#FFFDF9] p-2 rounded-xl border border-[#E8DFD5]">
                <span className="text-[10px] uppercase font-bold text-[#7D6B5E] block">Distance</span>
                <span className="text-xs font-bold text-[#9A5B35]">{routeData.distanceKm} km</span>
              </div>
              <div className="bg-[#FFFDF9] p-2 rounded-xl border border-[#E8DFD5]">
                <span className="text-[10px] uppercase font-bold text-[#7D6B5E] block">Est. Time</span>
                <span className="text-xs font-bold text-[#2D6A4F]">~{routeData.durationMinutes} min</span>
              </div>
              <div className="bg-[#FFFDF9] p-2 rounded-xl border border-[#E8DFD5]">
                <span className="text-[10px] uppercase font-bold text-[#7D6B5E] block">EV Energy</span>
                <span className="text-xs font-bold text-[#2D211A]">~{routeData.estimatedEnergyConsumptionKwh} kWh</span>
              </div>
            </div>
          )}

          {/* Turn-by-Turn Maneuvers Collapsible Section */}
          {routeData && routeData.steps && routeData.steps.length > 0 && (
            <div className="mt-3 pt-2 border-t border-[#E8DFD5]">
              <button
                onClick={() => setShowDirections(!showDirections)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#5D4A3E] hover:text-[#2D211A] py-1"
              >
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#9A5B35]" />
                  <span>Turn-by-Turn Directions ({routeData.steps.length} steps)</span>
                </span>
                {showDirections ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDirections && (
                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {routeData.steps.map((st, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] p-2 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5]">
                      <span className="w-4 h-4 rounded-full bg-[#FAEEE6] text-[#9A5B35] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-[#2D211A] font-medium block">{st.instruction}</span>
                        <span className="text-[10px] text-[#7D6B5E]">{st.distance} • {st.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="mt-3 pt-3 border-t border-[#E8DFD5] flex items-center space-x-2">
            <button
              onClick={() => navigate(`/stations/${selectedStation.id}`)}
              className="flex-1 py-2 px-3 bg-[#9A5B35] hover:bg-[#844A29] text-white text-xs font-bold rounded-xl shadow-warm-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>Reserve Slot at Station</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearRouteClick}
              className="py-2 px-3 bg-[#FFFDF9] hover:bg-[#F5F0E8] text-[#5D4A3E] border border-[#E8DFD5] rounded-xl text-xs font-semibold transition-all shadow-warm-sm flex items-center space-x-1"
              title="Remove route and clear map"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8B786A]" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
