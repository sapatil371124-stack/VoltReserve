import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, Zap, Calendar, Users, ShieldCheck,
  Plus, Edit2, Trash2, RefreshCw, AlertTriangle, CheckCircle2,
  DollarSign, Activity, FileText, ArrowRight, Play, AlertCircle
} from 'lucide-react';
import { adminService, stationService, slotService, blockchainService, cityService, vehicleService } from '../services/api';
import { BlockchainBadge } from '../components/BlockchainBadge';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, stations, chargers, slots, bookings, blockchain, users
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [blockchainBlocks, setBlockchainBlocks] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slot Generator Form State
  const [slotGenData, setSlotGenData] = useState({
    chargerId: '',
    date: new Date().toISOString().split('T')[0],
    startHour: 8,
    endHour: 22,
    durationMinutes: 30
  });
  const [slotGenResult, setSlotGenResult] = useState(null);

  // New Station Form State
  const [showStationModal, setShowStationModal] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    description: '',
    locationId: '',
    operatingHours: '24/7',
    amenities: 'WiFi, Cafe, Restrooms',
    contactPhone: '+912066551101'
  });

  // Tamper Simulation Result
  const [tamperResult, setTamperResult] = useState('');

  const loadAllAdminData = () => {
    setLoading(true);
    Promise.all([
      adminService.getDashboardStats(),
      stationService.getStations(),
      adminService.getAllBookings(),
      adminService.getAllUsers(),
      blockchainService.getChain(),
      cityService.getCities(),
      cityService.getLocations(),
      vehicleService.getConnectorTypes(),
    ]).then(([statsRes, stnsRes, bksRes, usrsRes, chainRes, citiesRes, locsRes, connsRes]) => {
      setStats(statsRes);
      setStations(stnsRes);
      setBookings(bksRes);
      setUsers(usrsRes);
      setBlockchainBlocks(chainRes);
      setCities(citiesRes);
      setLocations(locsRes);
      setConnectors(connsRes);

      // Collect all chargers
      const allChgs = [];
      stnsRes.forEach(s => {
        if (s.chargers) {
          s.chargers.forEach(c => allChgs.push({ ...c, stationName: s.name }));
        }
      });
      setChargers(allChgs);
      if (allChgs.length > 0 && !slotGenData.chargerId) {
        setSlotGenData(prev => ({ ...prev, chargerId: allChgs[0].id }));
      }
      if (locsRes.length > 0 && !newStation.locationId) {
        setNewStation(prev => ({ ...prev, locationId: locsRes[0].id }));
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    try {
      const res = await slotService.generateSlots({
        ...slotGenData,
        chargerId: Number(slotGenData.chargerId),
        startHour: Number(slotGenData.startHour),
        endHour: Number(slotGenData.endHour),
        durationMinutes: Number(slotGenData.durationMinutes)
      });
      setSlotGenResult(res);
      loadAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate slots");
    }
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      await adminService.createStation({
        name: newStation.name,
        description: newStation.description,
        operatingHours: newStation.operatingHours,
        amenities: newStation.amenities,
        contactPhone: newStation.contactPhone,
        location: { id: Number(newStation.locationId) }
      });
      setShowStationModal(false);
      loadAllAdminData();
    } catch (err) {
      alert("Failed to create station");
    }
  };

  const handleDeleteStation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this charging station?")) return;
    try {
      await adminService.deleteStation(id);
      loadAllAdminData();
    } catch (err) {
      alert("Failed to delete station");
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      loadAllAdminData();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const handleSimulateTamper = async (bookingId) => {
    try {
      await blockchainService.simulateTamper(bookingId);
      setTamperResult(`Tampering simulated on Booking #${bookingId}! Database value altered.`);
      loadAllAdminData();
    } catch (err) {
      alert("Failed to simulate tampering");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F5F0E8] min-h-screen">
      {/* Admin Portal Header */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#FAEEE6] text-[#9A5B35] uppercase tracking-wider">
              OPERATOR HUB
            </span>
            <span className="text-xs text-[#2D6A4F] font-semibold">ROLE_ADMIN Authorized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-[#2D211A]">VoltReserve Central Administration</h1>
          <p className="text-xs text-[#7D6B5E] mt-1">
            Provision time slots, manage dispensers, audit cryptographic transactions, and monitor grid utilization.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F5F0E8] text-[#2D211A] border border-[#E8DFD5] rounded-xl text-xs font-bold flex items-center space-x-1.5 self-start md:self-auto transition-all shadow-warm-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#9A5B35]" />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8DFD5] pb-3">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'stations', label: `Stations (${stations.length})`, icon: <MapPin className="w-4 h-4" /> },
          { id: 'chargers', label: `Chargers (${chargers.length})`, icon: <Zap className="w-4 h-4" /> },
          { id: 'slots', label: 'Slot Generator', icon: <Calendar className="w-4 h-4" /> },
          { id: 'bookings', label: `All Bookings (${bookings.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'blockchain', label: `Blockchain Ledger (${blockchainBlocks.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'users', label: `Drivers (${users.length})`, icon: <Users className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === tab.id
                ? 'bg-[#9A5B35] text-white shadow-warm-sm'
                : 'bg-[#FFFDF9] hover:bg-[#FAF7F2] text-[#5D4A3E] border border-[#E8DFD5]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Total Registered Drivers</span>
              <span className="text-2xl font-bold text-[#2D211A] mt-1 block">{stats.totalUsers}</span>
            </div>
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Charging Hubs</span>
              <span className="text-2xl font-bold text-[#2D211A] mt-1 block">{stats.totalStations}</span>
            </div>
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Dispensers Online</span>
              <span className="text-2xl font-bold text-[#2D6A4F] mt-1 block">{stats.availableChargers} / {stats.totalChargers}</span>
            </div>
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Gross Revenue</span>
              <span className="text-2xl font-bold text-[#9A5B35] mt-1 block">₹{stats.totalRevenue}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Active Slot Locks</span>
              <span className="text-base font-bold text-[#2D211A] mt-1 block">{stats.activeBookings} Current Reservations</span>
            </div>
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Today's Traffic</span>
              <span className="text-base font-bold text-[#2D211A] mt-1 block">{stats.todayBookings} Sessions Scheduled</span>
            </div>
            <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Station Utilization</span>
              <span className="text-base font-bold text-[#2D6A4F] mt-1 block">{stats.stationUtilizationRate}% Capacity</span>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E8DFD5] shadow-warm-sm space-y-4">
            <h3 className="text-base font-bold text-[#2D211A]">Recent Charging Reservations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFD5] text-[#8B786A] uppercase font-bold text-[10px]">
                    <th className="pb-3">Ref ID</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Station</th>
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Tariff</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD5]">
                  {stats.recentBookings?.map((r, i) => (
                    <tr key={i} className="py-2.5">
                      <td className="py-2.5 font-mono font-bold text-[#9A5B35]">{r.reference}</td>
                      <td className="py-2.5 font-medium text-[#2D211A]">{r.user}</td>
                      <td className="py-2.5 text-[#5D4A3E] truncate max-w-[200px]">{r.station}</td>
                      <td className="py-2.5 text-[#7D6B5E]">
                        {new Date(r.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-2.5 font-bold text-[#2D211A]">₹{r.amount}</td>
                      <td className="py-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATIONS MANAGEMENT */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#2D211A]">Manage Charging Stations</h3>
            <button
              onClick={() => setShowStationModal(true)}
              className="px-4 py-2 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-warm-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Charging Station</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations.map(stn => (
              <div key={stn.id} className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] uppercase">
                      {stn.location?.cityName}
                    </span>
                    <h4 className="text-base font-bold text-[#2D211A] mt-1.5">{stn.name}</h4>
                    <p className="text-xs text-[#7D6B5E]">{stn.location?.address}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStation(stn.id)}
                    className="p-1.5 text-[#8B786A] hover:text-[#9E3B3B] rounded-lg hover:bg-[#FDE8E8]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DFD5] text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Chargers</span>
                    <span className="font-bold text-[#2D211A]">{stn.chargers?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Max Speed</span>
                    <span className="font-bold text-[#2D6A4F]">{stn.maxPowerKw} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Rating</span>
                    <span className="font-bold text-[#9A5B35]">★ {stn.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHARGERS */}
      {activeTab === 'chargers' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#2D211A]">Installed EVSE Hardware Dispensers</h3>
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] overflow-x-auto shadow-warm-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DFD5] bg-[#FAF7F2] text-[#8B786A] uppercase font-bold text-[10px]">
                  <th className="p-4">ID</th>
                  <th className="p-4">Station</th>
                  <th className="p-4">Identifier Code</th>
                  <th className="p-4">Connector</th>
                  <th className="p-4">Power Output</th>
                  <th className="p-4">Rate</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD5] font-medium">
                {chargers.map((c) => (
                  <tr key={c.id}>
                    <td className="p-4 font-mono font-bold text-[#8B786A]">#{c.id}</td>
                    <td className="p-4 font-bold text-[#2D211A]">{c.stationName}</td>
                    <td className="p-4 font-mono text-[#9A5B35] font-bold">{c.identifierCode}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FAF7F2] text-[#5D4A3E] border border-[#E8DFD5]">
                        {c.connectorTypeCode} ({c.currentType})
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#2D6A4F]">{c.powerOutputKw} kW</td>
                    <td className="p-4 font-bold text-[#2D211A]">₹{c.pricePerKwh}/kWh</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SLOT GENERATOR */}
      {activeTab === 'slots' && (
        <div className="max-w-xl mx-auto bg-[#FFFDF9] p-8 rounded-3xl border border-[#E8DFD5] shadow-warm-sm space-y-5">
          <div>
            <span className="text-xs uppercase font-bold text-[#9A5B35]">Batch Operations</span>
            <h3 className="text-lg font-bold text-[#2D211A]">Provision Charging Slot Batches</h3>
            <p className="text-xs text-[#7D6B5E] mt-1">
              Discretizes operational charging intervals to enforce unique scheduling and eliminate double-booking.
            </p>
          </div>

          {slotGenResult && (
            <div className="p-4 rounded-2xl bg-[#E8F3ED] border border-[#B7DFCA] text-[#2D6A4F] text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">{slotGenResult.message}</span>
                <span>Created {slotGenResult.count} new available 30-min slots for {slotGenResult.date}.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateSlots} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Target Charger Dispenser</label>
              <select
                value={slotGenData.chargerId}
                onChange={(e) => setSlotGenData({ ...slotGenData, chargerId: e.target.value })}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
              >
                {chargers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.stationName} — {c.identifierCode} ({c.powerOutputKw} kW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Target Date</label>
              <input
                type="date"
                required
                value={slotGenData.date}
                onChange={(e) => setSlotGenData({ ...slotGenData, date: e.target.value })}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Start Hour (0-23)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={slotGenData.startHour}
                  onChange={(e) => setSlotGenData({ ...slotGenData, startHour: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>
              <div>
                <label className="font-bold text-[#5D4A3E] uppercase block mb-1">End Hour (1-24)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={slotGenData.endHour}
                  onChange={(e) => setSlotGenData({ ...slotGenData, endHour: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl font-bold shadow-warm-sm transition-all flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Generate Discrete Slots</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#2D211A]">Central Reservation Ledger</h3>
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] overflow-x-auto shadow-warm-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DFD5] bg-[#FAF7F2] text-[#8B786A] uppercase font-bold text-[10px]">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Station</th>
                  <th className="p-4">Charger</th>
                  <th className="p-4">Time Window</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Blockchain Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD5] font-medium">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-4 font-mono font-bold text-[#9A5B35]">{b.bookingReference}</td>
                    <td className="p-4 text-[#2D211A]">{b.userName}</td>
                    <td className="p-4 text-[#5D4A3E] truncate max-w-[160px]">{b.stationName}</td>
                    <td className="p-4 font-mono text-[#7D6B5E]">{b.chargerCode}</td>
                    <td className="p-4 text-[#7D6B5E]">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-bold text-[#2D211A]">₹{b.totalAmount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3ED] text-[#2D6A4F] border border-[#B7DFCA]">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <BlockchainBadge
                        bookingId={b.id}
                        blockIndex={b.blockIndex}
                        transactionHash={b.blockchainHash}
                        initialStatus={b.blockchainStatus || 'VERIFIED'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BLOCKCHAIN LEDGER & TAMPER DEMO */}
      {activeTab === 'blockchain' && (
        <div className="space-y-6">
          <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E8DFD5] shadow-warm-sm space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-base font-bold text-[#2D211A]">SHA-256 Tamper-Evident Transaction Ledger</h3>
            </div>
            <p className="text-xs text-[#7D6B5E] leading-relaxed">
              Every confirmed booking forms a block cryptographically sealed with the hash of the preceding block (previousHash) and a canonical representation of the transaction parameters. Altering any operational database field breaks the hash equality and triggers instant tamper detection.
            </p>

            {tamperResult && (
              <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">{tamperResult} Click "Verify Proof" on that block below to witness cryptographic mismatch.</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {blockchainBlocks.map((blk) => (
              <div
                key={blk.id}
                className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-warm-sm hover:border-[#D59A6A] transition-colors space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C]">
                      Block #{blk.blockIndex}
                    </span>
                    <span className="font-mono text-[#7D6B5E] text-[11px]">
                      Booking ID #{blk.booking?.id || 'Ref'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BlockchainBadge
                      bookingId={blk.booking?.id}
                      blockIndex={blk.blockIndex}
                      transactionHash={blk.currentHash}
                      initialStatus="VERIFIED"
                    />

                    {blk.booking?.id && (
                      <button
                        onClick={() => handleSimulateTamper(blk.booking.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#9E3B3B] bg-[#FDE8E8] hover:bg-[#FCD4D4] rounded-lg border border-[#F8B4B4] transition-colors"
                      >
                        Simulate Tamper
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="text-[#7D6B5E] flex items-center">
                    <span className="w-24 uppercase font-bold text-[10px]">Prev Hash:</span>
                    <span className="text-[#8B786A] truncate">{blk.previousHash}</span>
                  </div>
                  <div className="text-[#7D6B5E] flex items-center">
                    <span className="w-24 uppercase font-bold text-[10px] text-[#9A5B35]">Block Hash:</span>
                    <span className="text-[#2D211A] font-bold truncate">{blk.currentHash}</span>
                  </div>
                  <div className="text-[#7D6B5E] flex items-center">
                    <span className="w-24 uppercase font-bold text-[10px]">Canonical:</span>
                    <span className="text-[#5D4A3E] truncate">{blk.dataPayload}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#2D211A]">Registered Drivers &amp; System Accounts</h3>
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD5] overflow-x-auto shadow-warm-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DFD5] bg-[#FAF7F2] text-[#8B786A] uppercase font-bold text-[10px]">
                  <th className="p-4">User ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered EV</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD5] font-medium">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-4 font-mono font-bold text-[#8B786A]">#{u.id}</td>
                    <td className="p-4 font-bold text-[#2D211A]">{u.fullName}</td>
                    <td className="p-4 text-[#5D4A3E]">{u.email}</td>
                    <td className="p-4 text-[#7D6B5E]">{u.phoneNumber || '—'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F2] text-[#9A5B35] border border-[#E8DFD5]">
                        {u.role?.name || u.role}
                      </span>
                    </td>
                    <td className="p-4 text-[#7D6B5E]">{u.vehicles?.length || 0} registered</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.enabled ? 'bg-[#E8F3ED] text-[#2D6A4F] border-[#B7DFCA]' : 'bg-[#FDE8E8] text-[#9E3B3B] border-[#F8B4B4]'
                      }`}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className="px-2.5 py-1 rounded-lg border border-[#E8DFD5] text-[#5D4A3E] hover:bg-[#FAF7F2] text-[11px] font-bold"
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE STATION MODAL */}
      {showStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D211A]/60 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-6 shadow-warm-xl border border-[#E8DFD5] space-y-4">
            <div className="flex justify-between items-center border-b border-[#E8DFD5] pb-3">
              <h3 className="text-lg font-bold text-[#2D211A]">Add New Charging Station</h3>
              <button onClick={() => setShowStationModal(false)} className="text-[#7D6B5E] hover:text-[#2D211A]">✕</button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5D4A3E] block mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nashik City Center Fast Hub"
                  value={newStation.name}
                  onChange={e => setNewStation({ ...newStation, name: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5D4A3E] block mb-1">Location / City Area</label>
                <select
                  value={newStation.locationId}
                  onChange={e => setNewStation({ ...newStation, locationId: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.cityName} - {loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5D4A3E] block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newStation.description}
                  onChange={e => setNewStation({ ...newStation, description: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5D4A3E] block mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={newStation.operatingHours}
                    onChange={e => setNewStation({ ...newStation, operatingHours: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5D4A3E] block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newStation.contactPhone}
                    onChange={e => setNewStation({ ...newStation, contactPhone: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DFD5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStationModal(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-[#5D4A3E] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl font-bold shadow-warm-sm"
                >
                  Create Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
