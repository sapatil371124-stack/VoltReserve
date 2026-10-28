import React, { useState, useEffect } from 'react';
import {
  Car, Plus, Trash2, Zap, BatteryCharging, ShieldCheck, AlertCircle,
  Star, CheckCircle2, Sliders, ArrowRight
} from 'lucide-react';
import { vehicleService } from '../services/api';
import { useVehicle } from '../context/VehicleContext';

export const VehiclesPage = () => {
  const { reloadVehicles, selectVehicle } = useVehicle();
  const [vehicles, setVehicles] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    vehicleType: 'CAR',
    batteryCapacityKwh: '40.5',
    maxChargingRateKw: '50.0',
    maxAcChargingRateKw: '7.4',
    maxDcChargingRateKw: '50.0',
    currentSocPercentage: '25.0',
    energyConsumptionWhPerKm: '140.0',
    connectorTypeId: '1',
    licensePlate: '',
    isDefault: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchVehicles = () => {
    setLoading(true);
    Promise.all([
      vehicleService.getMyVehicles(),
      vehicleService.getConnectorTypes()
    ]).then(([vData, cData]) => {
      setVehicles(vData);
      setConnectors(cData);
      if (cData.length > 0 && !formData.connectorTypeId) {
        setFormData(prev => ({ ...prev, connectorTypeId: cData[0].id }));
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this vehicle from your profile?")) return;
    try {
      await vehicleService.deleteVehicle(id);
      fetchVehicles();
      reloadVehicles();
    } catch (err) {
      alert("Failed to delete vehicle");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await vehicleService.setDefaultVehicle(id);
      fetchVehicles();
      reloadVehicles();
    } catch (err) {
      alert("Failed to set default vehicle");
    }
  };

  const handleUpdateCardSoc = async (v, newSoc) => {
    const soc = Math.min(100, Math.max(0, Number(newSoc)));
    const consumption = Number(v.energyConsumptionWhPerKm) || 140;
    const capacity = Number(v.batteryCapacityKwh) || 40.5;
    const range = Math.round((capacity * soc * 10) / consumption);
    try {
      await vehicleService.updateVehicleSoc(v.id, soc, range);
      fetchVehicles();
      reloadVehicles();
    } catch (err) {
      console.warn("Could not update SOC:", err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await vehicleService.addVehicle({
        ...formData,
        batteryCapacityKwh: Number(formData.batteryCapacityKwh),
        maxChargingRateKw: Number(formData.maxChargingRateKw),
        maxAcChargingRateKw: Number(formData.maxAcChargingRateKw || 7.4),
        maxDcChargingRateKw: Number(formData.maxDcChargingRateKw || formData.maxChargingRateKw),
        currentSocPercentage: Number(formData.currentSocPercentage || 25.0),
        energyConsumptionWhPerKm: Number(formData.energyConsumptionWhPerKm || 140.0),
        connectorTypeId: Number(formData.connectorTypeId)
      });
      setShowAddModal(false);
      setFormData({
        make: '',
        model: '',
        variant: '',
        vehicleType: 'CAR',
        batteryCapacityKwh: '40.5',
        maxChargingRateKw: '50.0',
        maxAcChargingRateKw: '7.4',
        maxDcChargingRateKw: '50.0',
        currentSocPercentage: '25.0',
        energyConsumptionWhPerKm: '140.0',
        connectorTypeId: connectors[0]?.id || '1',
        licensePlate: '',
        isDefault: false
      });
      fetchVehicles();
      reloadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#9A5B35]">Vehicle Fleet &amp; Specifications</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D211A] mt-1 tracking-tight">My Electric Vehicles</h1>
          <p className="text-xs sm:text-sm text-[#7D6B5E] mt-1">
            Manage your EV hardware configurations, battery state of charge (SOC), and connector compatibility.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl text-xs font-bold shadow-warm-sm transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Electric Vehicle</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9A5B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#7D6B5E] font-medium">Loading vehicle garage...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-3xl p-12 text-center border border-[#E8DFD5] max-w-md mx-auto space-y-4 shadow-warm-sm">
          <Car className="w-12 h-12 text-[#A69588] mx-auto" />
          <h3 className="text-base font-bold text-[#2D211A]">No Electric Vehicles Registered</h3>
          <p className="text-xs text-[#7D6B5E]">
            Register your EV model and battery specs to automatically filter compatible charging stations.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-[#9A5B35] hover:bg-[#844A29] text-white font-bold text-xs rounded-xl shadow-warm-sm"
          >
            Add Your First EV
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const soc = Number(v.currentSocPercentage) || 25;
            const range = Number(v.estimatedRangeKm) || 120;

            return (
              <div
                key={v.id}
                className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD5] shadow-warm-sm hover:border-[#D59A6A] transition-all space-y-4 relative"
              >
                {/* Default badge */}
                {v.isDefault && (
                  <div className="absolute top-4 right-14">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FAEEE6] text-[#9A5B35] border border-[#E8B89C] flex items-center space-x-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Default</span>
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAEEE6] border border-[#E8B89C] text-[#9A5B35] flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#2D211A] leading-tight">
                        {v.make} {v.model}
                      </h3>
                      <span className="text-xs text-[#7D6B5E]">{v.variant || 'Standard'} • <span className="font-mono text-[#2D211A] font-semibold">{v.licensePlate}</span></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(v.id)}
                    title="Remove vehicle"
                    className="p-1.5 text-[#8B786A] hover:text-[#9E3B3B] hover:bg-[#FDE8E8] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#E8DFD5] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Battery</span>
                    <span className="font-bold text-[#2D211A]">{v.batteryCapacityKwh} kWh</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#E8DFD5] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Max DC</span>
                    <span className="font-bold text-[#2D6A4F]">{v.maxDcChargingRateKw || v.maxChargingRateKw} kW</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#E8DFD5] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#8B786A] block">Connector</span>
                    <span className="font-bold text-[#9A5B35]">{v.connectorTypeCode || 'CCS2'}</span>
                  </div>
                </div>

                {/* Live SOC Slider on Card */}
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#9A5B35]" />
                      <span className="font-bold text-[#2D211A]">Current Battery:</span>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-sm font-extrabold text-[#9A5B35]">{soc}%</span>
                      <span className="text-[11px] text-[#7D6B5E]">({range} km)</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={soc}
                    onChange={(e) => handleUpdateCardSoc(v, e.target.value)}
                    className="w-full h-2 bg-[#E8DFD5] rounded-lg appearance-none cursor-pointer accent-[#9A5B35]"
                  />
                </div>

                {/* Card footer buttons */}
                <div className="flex items-center justify-between pt-1">
                  {!v.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(v.id)}
                      className="text-xs font-bold text-[#7D6B5E] hover:text-[#9A5B35] transition-colors"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#2D6A4F] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Primary Vehicle</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => selectVehicle(v)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAEEE6] hover:bg-[#F3DDD0] border border-[#E8B89C] text-xs font-bold text-[#9A5B35] transition-all"
                  >
                    Select for Booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D211A]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-6 shadow-warm-xl border border-[#E8DFD5] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
              <h3 className="text-base font-bold text-[#2D211A]">Register Electric Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#7D6B5E] hover:text-[#2D211A] font-bold">✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#9E3B3B] text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              
              {/* Vehicle Type */}
              <div>
                <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Vehicle Classification</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                >
                  <option value="CAR">4-Wheeler Car / SUV</option>
                  <option value="SCOOTER">2-Wheeler Electric Scooter</option>
                  <option value="MOTORCYCLE">2-Wheeler Electric Motorcycle</option>
                  <option value="COMMERCIAL">Commercial / Fleet EV</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata, MG, Ather"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexon EV, 450X"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Variant / Trim</label>
                <input
                  type="text"
                  placeholder="e.g. Max XZ+ Lux, Pro 3.7"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Battery (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.batteryCapacityKwh}
                    onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Max DC (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.maxChargingRateKw}
                    onChange={(e) => setFormData({ ...formData, maxChargingRateKw: e.target.value, maxDcChargingRateKw: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Max AC (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxAcChargingRateKw}
                    onChange={(e) => setFormData({ ...formData, maxAcChargingRateKw: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Connector Port</label>
                  <select
                    value={formData.connectorTypeId}
                    onChange={(e) => setFormData({ ...formData, connectorTypeId: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl font-semibold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  >
                    {connectors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5D4A3E] uppercase block mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-15-EV-1024"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl uppercase font-mono font-bold text-[#2D211A] focus:outline-none focus:border-[#9A5B35]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5D4A3E] uppercase block mb-1">Initial Battery Level (SOC %)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.currentSocPercentage}
                    onChange={(e) => setFormData({ ...formData, currentSocPercentage: e.target.value })}
                    className="flex-1 h-2 bg-[#E8DFD5] rounded-lg appearance-none cursor-pointer accent-[#9A5B35]"
                  />
                  <span className="font-extrabold text-[#9A5B35] w-12 text-right">{formData.currentSocPercentage}%</span>
                </div>
              </div>

              <div className="pt-1 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-[#9A5B35] focus:ring-[#9A5B35] border-[#E8DFD5]"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-[#5D4A3E] cursor-pointer">
                  Set this vehicle as primary default
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8DFD5] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl font-bold text-[#5D4A3E] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#9A5B35] hover:bg-[#844A29] text-white rounded-xl font-bold disabled:opacity-50 shadow-warm-sm"
                >
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
