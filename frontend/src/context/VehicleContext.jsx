import React, { createContext, useContext, useState, useEffect } from 'react';
import { vehicleService } from '../services/api';
import { useAuth } from './AuthContext';

const VehicleContext = createContext(null);

export const VehicleProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [currentSoc, setCurrentSoc] = useState(25);
  const [estimatedRange, setEstimatedRange] = useState(120);
  const [targetSoc, setTargetSoc] = useState(80);
  const [chargingGoalMode, setChargingGoalMode] = useState('PERCENTAGE'); // 'PERCENTAGE' | 'ENERGY' | 'TIME'
  const [desiredKwh, setDesiredKwh] = useState(20);
  const [desiredDurationMinutes, setDesiredDurationMinutes] = useState(45);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute estimated range from capacity, SOC, and consumption
  const calculateRange = (vehicle, soc) => {
    if (!vehicle) return Math.round(soc * 4.5);
    const capacityKwh = Number(vehicle.batteryCapacityKwh) || 40.5;
    const consumptionWh = Number(vehicle.energyConsumptionWhPerKm) || 140;
    const totalEnergyWh = capacityKwh * 1000 * (soc / 100);
    return Math.max(1, Math.round(totalEnergyWh / consumptionWh));
  };

  const loadVehicles = async () => {
    if (!isAuthenticated) {
      // Default fallback mock vehicle for anonymous browsing
      const fallback = {
        id: 1,
        make: 'Tata',
        model: 'Nexon EV Max',
        variant: 'XZ+ Lux',
        vehicleType: 'CAR',
        batteryCapacityKwh: 40.5,
        maxChargingRateKw: 50.0,
        maxAcChargingRateKw: 7.4,
        maxDcChargingRateKw: 50.0,
        currentSocPercentage: 25.0,
        estimatedRangeKm: 120.0,
        energyConsumptionWhPerKm: 140.0,
        connectorTypeCode: 'CCS2',
        connectorTypeName: 'CCS Type 2',
        licensePlate: 'MH 15 EF 9021',
        isDefault: true
      };
      setVehicles([fallback]);
      setActiveVehicle(fallback);
      setCurrentSoc(25);
      setEstimatedRange(120);
      return;
    }

    setLoading(true);
    try {
      const data = await vehicleService.getMyVehicles();
      if (data && data.length > 0) {
        setVehicles(data);
        const def = data.find(v => v.isDefault) || data[0];
        setActiveVehicle(def);
        const socVal = Number(def.currentSocPercentage) || 25;
        setCurrentSoc(socVal);
        const rangeVal = def.estimatedRangeKm ? Number(def.estimatedRangeKm) : calculateRange(def, socVal);
        setEstimatedRange(rangeVal);
      } else {
        // Fallback demo vehicle
        const demo = {
          id: null,
          make: 'Tata',
          model: 'Nexon EV Max',
          variant: 'XZ+ Lux',
          vehicleType: 'CAR',
          batteryCapacityKwh: 40.5,
          maxChargingRateKw: 50.0,
          connectorTypeCode: 'CCS2',
          licensePlate: 'MH 15 EF 9021'
        };
        setVehicles([demo]);
        setActiveVehicle(demo);
      }
    } catch (err) {
      console.error("Failed to load user vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [isAuthenticated]);

  // Update battery status
  const updateBatteryStatus = async (soc, customRange = null) => {
    const validSoc = Math.min(100, Math.max(0, Number(soc)));
    setCurrentSoc(validSoc);
    const range = customRange !== null ? customRange : calculateRange(activeVehicle, validSoc);
    setEstimatedRange(range);

    // If target is less than or equal to new current SOC, automatically adjust target
    if (targetSoc <= validSoc) {
      setTargetSoc(Math.min(100, validSoc + 30));
    }

    if (activeVehicle && activeVehicle.id && isAuthenticated) {
      try {
        await vehicleService.updateVehicleSoc(activeVehicle.id, validSoc, range);
      } catch (e) {
        console.warn("Could not sync SOC with backend:", e.message);
      }
    }
  };

  // Change selected vehicle
  const selectVehicle = (vehicle) => {
    setActiveVehicle(vehicle);
    const soc = Number(vehicle.currentSocPercentage) || 25;
    setCurrentSoc(soc);
    const range = vehicle.estimatedRangeKm ? Number(vehicle.estimatedRangeKm) : calculateRange(vehicle, soc);
    setEstimatedRange(range);
    if (targetSoc <= soc) {
      setTargetSoc(Math.min(100, soc + 30));
    }
  };

  // Calculations for goal
  const capacityKwh = Number(activeVehicle?.batteryCapacityKwh) || 40.5;
  const socDifference = Math.max(0, targetSoc - currentSoc);
  const energyNeededBatteryKwh = Math.round((capacityKwh * (socDifference / 100)) * 100) / 100;
  const energyNeededGridKwh = Math.round((energyNeededBatteryKwh / 0.90) * 100) / 100;
  const consumptionWh = Number(activeVehicle?.energyConsumptionWhPerKm) || 140;
  const rangeAddedKm = Math.round((energyNeededBatteryKwh * 1000) / consumptionWh);

  return (
    <VehicleContext.Provider value={{
      vehicles,
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
      calculateRange,
      updateBatteryStatus,
      selectVehicle,
      showConfirmModal,
      setShowConfirmModal,
      reloadVehicles: loadVehicles,
      loading
    }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
