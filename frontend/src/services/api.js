import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vr_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic auth expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token so subsequent actions can re-authenticate
      localStorage.removeItem('vr_token');
      localStorage.removeItem('vr_user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('vr_token', response.data.token);
      localStorage.setItem('vr_user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('vr_token', response.data.token);
      localStorage.setItem('vr_user', JSON.stringify(response.data));
    }
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('vr_token');
    localStorage.removeItem('vr_user');
  }
};

export const cityService = {
  getCities: async () => {
    const response = await api.get('/cities');
    return response.data;
  },
  getLocations: async (cityId) => {
    const response = await api.get('/locations', { params: { cityId } });
    return response.data;
  }
};

export const stationService = {
  getStations: async (params) => {
    const response = await api.get('/stations', { params });
    return response.data;
  },
  getStationById: async (id, coords) => {
    const response = await api.get(`/stations/${id}`, { params: coords });
    return response.data;
  },
  compareStations: async (ids, coords) => {
    const response = await api.get('/stations/compare', {
      params: { ids: ids.join(','), ...coords }
    });
    return response.data;
  },
  getChargers: async (stationId) => {
    const response = await api.get(`/stations/${stationId}/chargers`);
    return response.data;
  },
  getRecommendations: async (params) => {
    const response = await api.get('/recommendations', { params });
    return response.data;
  }
};

export const slotService = {
  getSlots: async (chargerId, date) => {
    const response = await api.get(`/chargers/${chargerId}/slots`, { params: { date } });
    return response.data;
  },
  getFlexibleIntervals: async (chargerId, date, durationMinutes) => {
    const response = await api.get(`/chargers/${chargerId}/flexible-intervals`, {
      params: { date, durationMinutes }
    });
    return response.data;
  },
  generateSlots: async (data) => {
    const response = await api.post('/admin/slots/generate', data);
    return response.data;
  }
};

export const bookingService = {
  holdSlot: async (slotId, vehicleId) => {
    const response = await api.post('/bookings/hold', { slotId, vehicleId });
    return response.data;
  },
  confirmBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  getBookingByReference: async (ref) => {
    const response = await api.get(`/bookings/reference/${encodeURIComponent(ref)}`);
    return response.data;
  },
  cancelBooking: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
  simulateSession: async (id, status) => {
    const response = await api.post(`/bookings/${id}/simulate-session`, null, {
      params: { status }
    });
    return response.data;
  }
};

export const routingService = {
  calculateRoute: async (routeRequest) => {
    const { originLat, originLng, destinationLat, destinationLng, stationId } = routeRequest;
    const orsApiKey = import.meta.env.VITE_ROUTING_API_KEY;

    // 1. Try OpenRouteService if API key is configured
    if (orsApiKey && orsApiKey.trim().length > 10) {
      try {
        const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey.trim()}&start=${originLng},${originLat}&end=${destinationLng},${destinationLat}`;
        const orsRes = await axios.get(orsUrl, { timeout: 6000 });
        if (orsRes.data?.features?.[0]) {
          const feat = orsRes.data.features[0];
          const summary = feat.properties.summary;
          const coords = feat.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const distKm = parseFloat((summary.distance / 1000).toFixed(1));
          const durationMins = Math.max(1, Math.round(summary.duration / 60));
          const steps = feat.properties.segments?.[0]?.steps?.map(s => ({
            instruction: s.instruction,
            distance: s.distance > 1000 ? `${(s.distance / 1000).toFixed(1)} km` : `${Math.round(s.distance)} m`,
            duration: `${Math.max(1, Math.round(s.duration / 60))} min`
          })) || [];

          return {
            distanceKm: distKm,
            durationMinutes: durationMins,
            coordinates: coords,
            summary: `Driving route via OpenRouteService (${distKm} km, ~${durationMins} mins)`,
            estimatedEnergyConsumptionKwh: parseFloat((distKm * 0.16).toFixed(2)),
            steps,
            provider: 'OpenRouteService'
          };
        }
      } catch (orsErr) {
        console.warn("OpenRouteService request failed, falling back to OSRM:", orsErr.message);
      }
    }

    // 2. High-accuracy real road network: OpenStreetMap OSRM routing engine
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}?overview=full&geometries=geojson&steps=true`;
      const osrmRes = await axios.get(osrmUrl, { timeout: 7000 });
      if (osrmRes.data?.routes?.[0]) {
        const r = osrmRes.data.routes[0];
        const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distKm = parseFloat((r.distance / 1000).toFixed(1));
        const durationMins = Math.max(1, Math.round(r.duration / 60));
        
        // Format turn-by-turn directions
        const rawSteps = r.legs?.[0]?.steps || [];
        const steps = rawSteps.map((st, i) => {
          let text = '';
          const m = st.maneuver || {};
          const road = st.name || (i === 0 ? 'starting roadway' : 'destination street');
          
          if (m.type === 'depart') {
            text = `Head ${m.modifier || 'forward'} onto ${road}`.trim();
          } else if (m.type === 'arrive') {
            text = `Arrive at charging station ${m.modifier ? 'on ' + m.modifier : ''}`.trim();
          } else if (m.type === 'turn') {
            text = `Turn ${m.modifier || 'onto'} ${road}`.trim();
          } else if (m.type === 'roundabout') {
            text = `Enter roundabout and take exit onto ${road}`.trim();
          } else if (m.type === 'on ramp' || m.type === 'off ramp') {
            text = `Take ${m.type} onto ${road}`.trim();
          } else if (m.type === 'fork') {
            text = `Keep ${m.modifier || 'right'} at fork onto ${road}`.trim();
          } else {
            text = `Continue on ${road}`.trim();
          }

          const distStr = st.distance > 1000 ? `${(st.distance / 1000).toFixed(1)} km` : `${Math.round(st.distance)} m`;
          return {
            instruction: text,
            distance: distStr,
            duration: st.duration > 60 ? `~${Math.round(st.duration / 60)} min` : '< 1 min'
          };
        }).filter(s => s.instruction.length > 0);

        return {
          distanceKm: distKm,
          durationMinutes: durationMins,
          coordinates: coords,
          summary: `Fastest road navigation via OpenStreetMap road network (${distKm} km, ~${durationMins} mins)`,
          estimatedEnergyConsumptionKwh: parseFloat((distKm * 0.16).toFixed(2)),
          steps,
          provider: 'OpenStreetMap (OSRM)'
        };
      }
    } catch (osrmErr) {
      console.warn("OSRM routing failed, falling back to local backend route engine:", osrmErr.message);
    }

    // 3. Fallback: Internal backend /routes endpoint
    try {
      const response = await api.post('/routes', routeRequest);
      return {
        ...response.data,
        steps: [
          { instruction: 'Head towards destination corridor via main highway', distance: `${response.data.distanceKm} km`, duration: `~${response.data.durationMinutes} min` },
          { instruction: 'Arrive at charging hub entrance', distance: '100 m', duration: '1 min' }
        ],
        provider: 'VoltReserve Road Engine'
      };
    } catch (apiErr) {
      console.error("All routing providers failed:", apiErr);
      throw new Error("Unable to calculate route. Please check connection and coordinates.");
    }
  }
};

export const blockchainService = {
  verifyBooking: async (bookingId) => {
    const response = await api.post(`/blockchain/${bookingId}/verify`);
    return response.data;
  },
  getChain: async () => {
    const response = await api.get('/blockchain/chain');
    return response.data;
  },
  simulateTamper: async (bookingId) => {
    const response = await api.post(`/admin/blockchain/simulate-tamper/${bookingId}`);
    return response.data;
  }
};

export const vehicleService = {
  getMyVehicles: async () => {
    const response = await api.get('/vehicles/my');
    return response.data;
  },
  addVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },
  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },
  updateVehicleSoc: async (id, currentSocPercentage, estimatedRangeKm) => {
    const response = await api.patch(`/vehicles/${id}/soc`, { currentSocPercentage, estimatedRangeKm });
    return response.data;
  },
  setDefaultVehicle: async (id) => {
    const response = await api.patch(`/vehicles/${id}/default`);
    return response.data;
  },
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
  getConnectorTypes: async () => {
    const response = await api.get('/connector-types');
    return response.data;
  }
};

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  toggleUserStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/toggle-status`);
    return response.data;
  },
  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },
  getAllSessions: async () => {
    const response = await api.get('/admin/sessions');
    return response.data;
  },
  createStation: async (data) => {
    const response = await api.post('/admin/stations', data);
    return response.data;
  },
  updateStation: async (id, data) => {
    const response = await api.put(`/admin/stations/${id}`, data);
    return response.data;
  },
  deleteStation: async (id) => {
    const response = await api.delete(`/admin/stations/${id}`);
    return response.data;
  },
  createCharger: async (data) => {
    const response = await api.post('/admin/chargers', data);
    return response.data;
  },
  updateCharger: async (id, data) => {
    const response = await api.put(`/admin/chargers/${id}`, data);
    return response.data;
  },
  deleteCharger: async (id) => {
    const response = await api.delete(`/admin/chargers/${id}`);
    return response.data;
  }
};

export default api;
