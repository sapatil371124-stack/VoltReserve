-- ============================================================================
-- VoltReserve Relational Database Schema (MySQL 8.0+)
-- Double-Booking Prevention, Cryptographic Auditing & Full Reservation Lifecycle
-- ============================================================================

CREATE DATABASE IF NOT EXISTS voltreserve
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE voltreserve;

-- Drop tables in reverse order of foreign key dependencies for clean initialization
DROP TABLE IF EXISTS blockchain_records;
DROP TABLE IF EXISTS charging_sessions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS charging_slots;
DROP TABLE IF EXISTS chargers;
DROP TABLE IF EXISTS charging_stations;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS connector_types;
DROP TABLE IF EXISTS users;

-- 1. USERS
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CONNECTOR TYPES (e.g. CCS2, Type 2 AC, CHAdeMO, GB/T)
CREATE TABLE connector_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    current_type ENUM('AC', 'DC') NOT NULL,
    max_power_kw DECIMAL(6,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. VEHICLES (User's EV profiles with connector compatibility)
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    variant VARCHAR(50),
    vehicle_type VARCHAR(30) DEFAULT 'CAR',
    battery_capacity_kwh DECIMAL(6,2) NOT NULL,
    max_charging_rate_kw DECIMAL(6,2) NOT NULL,
    max_ac_charging_rate_kw DECIMAL(6,2) DEFAULT 7.40,
    max_dc_charging_rate_kw DECIMAL(6,2) DEFAULT 50.00,
    current_soc_percentage DECIMAL(5,2) DEFAULT 25.00,
    estimated_range_km DECIMAL(6,2) DEFAULT 120.00,
    energy_consumption_wh_per_km DECIMAL(6,2) DEFAULT 140.00,
    is_default BOOLEAN DEFAULT FALSE,
    connector_type_id BIGINT NOT NULL,
    license_plate VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicle_connector FOREIGN KEY (connector_type_id) REFERENCES connector_types(id) ON DELETE RESTRICT,
    INDEX idx_vehicle_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CITIES (e.g. Nashik, Pune, Mumbai)
CREATE TABLE cities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'India',
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_city_state (name, state),
    INDEX idx_city_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LOCATIONS (Specific geographic hubs/areas within a city)
CREATE TABLE locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    landmark VARCHAR(120),
    postal_code VARCHAR(20),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_location_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_location_city (city_id),
    INDEX idx_location_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CHARGING STATIONS
CREATE TABLE charging_stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    operating_hours VARCHAR(100) NOT NULL DEFAULT '24/7',
    amenities TEXT,
    rating DECIMAL(3,2) NOT NULL DEFAULT 4.50,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    contact_phone VARCHAR(25),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_station_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    INDEX idx_station_location (location_id),
    INDEX idx_station_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CHARGERS (Physical dispensers / EVSE at a station)
CREATE TABLE chargers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    connector_type_id BIGINT NOT NULL,
    identifier_code VARCHAR(50) NOT NULL,
    power_output_kw DECIMAL(6,2) NOT NULL,
    current_type ENUM('AC', 'DC') NOT NULL,
    price_per_kwh DECIMAL(8,2) NOT NULL,
    status ENUM('ACTIVE', 'MAINTENANCE', 'OFFLINE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_charger_station FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE,
    CONSTRAINT fk_charger_connector FOREIGN KEY (connector_type_id) REFERENCES connector_types(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_station_charger_code (station_id, identifier_code),
    INDEX idx_charger_station (station_id),
    INDEX idx_charger_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. CHARGING SLOTS
-- Enforces slot discretization, temporary holds and optimistic locking
CREATE TABLE charging_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    charger_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('AVAILABLE', 'HELD', 'BOOKED', 'OCCUPIED', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
    hold_expires_at DATETIME NULL,
    held_by_user_id BIGINT NULL,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slot_charger FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_held_user FOREIGN KEY (held_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uq_charger_slot_time (charger_id, start_time),
    INDEX idx_slot_status_time (charger_id, status, start_time, end_time),
    INDEX idx_slot_hold_expiry (hold_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BOOKINGS
-- Full reservation details, holding window, and lifecycle tracking
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(32) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    charger_id BIGINT NOT NULL,
    slot_id BIGINT NULL,
    vehicle_id BIGINT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    estimated_kwh DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    base_amount DECIMAL(10,2) NULL,
    gst_amount DECIMAL(10,2) NULL,
    platform_fee DECIMAL(10,2) DEFAULT 15.00,
    target_soc_percentage DECIMAL(5,2) DEFAULT 80.00,
    initial_soc_percentage DECIMAL(5,2) DEFAULT 25.00,
    charging_duration_minutes INT DEFAULT 45,
    tariff_snapshot DECIMAL(8,2) DEFAULT 18.50,
    status ENUM('HELD', 'CONFIRMED', 'OCCUPIED', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'HELD',
    hold_expires_at DATETIME NULL,
    confirmed_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    cancellation_reason VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_charger FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) REFERENCES charging_slots(id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_charger_time (charger_id, start_time, end_time),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PAYMENTS (Payment-ready mock & integration architecture)
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    gateway_response TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_payment_booking (booking_id),
    INDEX idx_payment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CHARGING SESSIONS (Operational charging hardware telemetry/metering)
CREATE TABLE charging_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    charger_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    actual_start_time DATETIME NULL,
    actual_end_time DATETIME NULL,
    start_meter_kwh DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    end_meter_kwh DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_kwh_delivered DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    peak_power_kw DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    status ENUM('PENDING', 'CHARGING', 'COMPLETED', 'INTERRUPTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_charger FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_session_booking (booking_id),
    INDEX idx_session_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BLOCKCHAIN RECORDS (Cryptographic ledger verification via SHA-256 block chain)
CREATE TABLE blockchain_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    block_index BIGINT NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL UNIQUE,
    transaction_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    canonical_data TEXT NOT NULL,
    hash_algorithm VARCHAR(20) NOT NULL DEFAULT 'SHA-256',
    status ENUM('VERIFIED', 'TAMPER_DETECTED') NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blockchain_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    INDEX idx_blockchain_hash (transaction_hash),
    INDEX idx_blockchain_index (block_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
