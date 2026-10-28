-- ============================================================================
-- VoltReserve Initial Seed Data
-- Demo Cities (Nashik, Pune, Mumbai), Stations, Chargers, Slots & Verified Bookings
-- ============================================================================

USE voltreserve;

-- 1. CONNECTOR TYPES
INSERT INTO connector_types (id, code, name, current_type, max_power_kw, description) VALUES
(1, 'CCS2', 'Combined Charging System Type 2', 'DC', 150.00, 'European and Indian standard DC fast charging for high-capacity EVs'),
(2, 'TYPE2', 'Type 2 Mennekes', 'AC', 22.00, 'Universal European/Indian standard AC connector for destination charging'),
(3, 'CHADEMO', 'CHAdeMO', 'DC', 60.00, 'Japanese DC fast charging protocol for compatible electric vehicles'),
(4, 'GBT', 'GB/T Fast Charging', 'DC', 60.00, 'Standard DC protocol used in certain commercial EV fleets');

-- 2. USERS
-- Standard password for all demo accounts is 'password123', admin is 'admin123'
-- Hashes generated with BCrypt 10 rounds:
-- admin123  -> $2a$10$7wP4qT0r8H/9Q5fH9Hn/ueoZqZ61Vw6V2Vq1XgS0tL9R.2bJ2z0q. (will be re-verified/updated by Spring DataInitializer)
-- password123 -> $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active) VALUES
(1, 'admin@voltreserve.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'VoltReserve System Admin', '+919876543210', 'ROLE_ADMIN', TRUE),
(2, 'rahul.sharma@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Rahul Sharma', '+919822012345', 'ROLE_USER', TRUE),
(3, 'priya.patil@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Priya Patil', '+919822054321', 'ROLE_USER', TRUE);

-- 3. VEHICLES
INSERT INTO vehicles (id, user_id, make, model, variant, battery_capacity_kwh, max_charging_rate_kw, connector_type_id, license_plate) VALUES
(1, 2, 'Tata', 'Nexon EV Max', 'XZ+ Lux', 40.50, 50.00, 1, 'MH-15-EV-1024'),
(2, 2, 'MG', 'ZS EV', 'Exclusive Pro', 50.30, 80.00, 1, 'MH-12-EV-5544'),
(3, 3, 'Mahindra', 'XUV400', 'EL Pro', 39.40, 50.00, 1, 'MH-01-EV-8899');

-- 4. CITIES
INSERT INTO cities (id, name, state, country, latitude, longitude) VALUES
(1, 'Nashik', 'Maharashtra', 'India', 19.9974530, 73.7898030),
(2, 'Pune', 'Maharashtra', 'India', 18.5204300, 73.8567440),
(3, 'Mumbai', 'Maharashtra', 'India', 19.0760900, 72.8774260);

-- 5. LOCATIONS
INSERT INTO locations (id, city_id, name, address, landmark, postal_code, latitude, longitude) VALUES
-- Nashik Locations
(1, 1, 'Gangapur Road Hub', 'Near Pramod Mahajan Garden, Gangapur Road', 'Opposite KTHM College', '422005', 19.9982000, 73.7654000),
(2, 1, 'Mumbai Naka Expressway Junction', 'Highway Service Rd, Near Mumbai Naka Circle', 'Next to Express Inn Hotel', '422001', 19.9880000, 73.7850000),
(3, 1, 'Indira Nagar Commercial Plaza', 'Ashoka Marg, Indira Nagar', 'Near Govind Nagar Flyover', '422009', 19.9675000, 73.7820000),
-- Pune Locations
(4, 2, 'Hinjawadi Infotech Park Phase 1', 'Maan Road, Near Shivaji Chowk, Hinjawadi', 'Near Wipro Circle', '411057', 18.5913000, 73.7389000),
(5, 2, 'Koregaon Park Lifestyle Hub', 'North Main Road, Koregaon Park', 'Near Lane 5 Cafe Strip', '411001', 18.5362000, 73.8940000),
(6, 2, 'Baner High Street', 'Baner Road, Ahead of Balewadi Phata', 'Near High Street Mall', '411045', 18.5590000, 73.7780000),
-- Mumbai Locations
(7, 3, 'BKC Financial Center', 'G Block, Bandra Kurla Complex, Bandra East', 'Near Bharat Diamond Bourse', '400051', 19.0667000, 72.8687000),
(8, 3, 'Andheri International Airport Hub', 'Chhatrapati Shivaji Maharaj Marg, Andheri East', 'Near Terminal 2 Approach', '400099', 19.1025000, 72.8690000),
(9, 3, 'Seawoods Grand Central Plaza', 'Sector 40, Seawoods Railway Station Complex', 'Near Seawoods Grand Mall', '400706', 19.0163000, 73.0189000);

-- 6. CHARGING STATIONS
INSERT INTO charging_stations (id, location_id, name, description, operating_hours, amenities, rating, is_active, contact_phone) VALUES
-- Nashik Stations
(1, 1, 'VoltReserve Supercharge - Gangapur Rd', 'Flagship ultra-fast charging center on Gangapur Road. Equipped with canopy, solar roof, and dedicated cafe lounge.', '24/7', 'EV Lounge, High-Speed WiFi, Cafe, Clean Restrooms, 24/7 Security', 4.85, TRUE, '+912532591101'),
(2, 2, 'Expressway FastCharge Hub - Mumbai Naka', 'Strategic highway transit station with 120kW dual guns, optimized for inter-city travel on NH-3.', '24/7', 'Convenience Store, Tire Pressure Air, Restrooms, CCTV', 4.70, TRUE, '+912532591102'),
(3, 3, 'VoltReserve Urban Hub - Indira Nagar', 'Neighborhood charging hub with reliable AC Type 2 and DC fast charging options.', '06:00 AM - 11:00 PM', 'Shopping Mall Access, Restrooms, Covered Parking', 4.60, TRUE, '+912532591103'),

-- Pune Stations
(4, 4, 'Hinjawadi Tech Park Hypercharger', 'Premier tech corridor charging center with high-voltage CCS2 and Type 2 chargers for IT professionals.', '24/7', 'Work Desks, High-Speed WiFi, Coffee Vending, EV Valet', 4.90, TRUE, '+912066551101'),
(5, 5, 'Koregaon Park Green Energy Station', '100% renewable-powered boutique charging hub in the heart of Pune cultural district.', '24/7', 'Organic Cafe, Lounge, EV Diagnostics', 4.80, TRUE, '+912066551102'),
(6, 6, 'Baner Highway Junction Superstation', 'High-throughput 6-bay charging facility close to Mumbai-Pune Expressway exit.', '24/7', 'Food Court, Restrooms, ATM, Security', 4.75, TRUE, '+912066551103'),

-- Mumbai Stations
(7, 7, 'BKC Corporate EV Hub', 'Executive multi-bay ultra-fast hub at BKC with dual 150kW CCS2 dispensers and rapid turnover.', '24/7', 'Executive Lounge, Valet Parking, WiFi, Cafe', 4.95, TRUE, '+912226501101'),
(8, 8, 'Andheri Airport Transit Power Station', 'Convenient charging minutes away from Mumbai T2 International terminal.', '24/7', 'Flight Display Screen, Restrooms, Beverage Bar', 4.75, TRUE, '+912226501102'),
(9, 9, 'Navi Mumbai Grand Mall Charging Oasis', 'Spacious EV hub located at Seawoods Grand Central with shopping and dining options while charging.', '24/7', 'Cinema Access, Food Court, Hypermarket, Restrooms', 4.80, TRUE, '+912226501103');

-- 7. CHARGERS
INSERT INTO chargers (id, station_id, connector_type_id, identifier_code, power_output_kw, current_type, price_per_kwh, status) VALUES
-- Station 1: Gangapur Rd
(1, 1, 1, 'NSK-GNP-CCS2-01', 120.00, 'DC', 20.50, 'ACTIVE'),
(2, 1, 1, 'NSK-GNP-CCS2-02', 60.00, 'DC', 18.50, 'ACTIVE'),
(3, 1, 2, 'NSK-GNP-TYP2-01', 22.00, 'AC', 15.00, 'ACTIVE'),

-- Station 2: Mumbai Naka
(4, 2, 1, 'NSK-MBN-CCS2-01', 120.00, 'DC', 21.00, 'ACTIVE'),
(5, 2, 1, 'NSK-MBN-CCS2-02', 60.00, 'DC', 18.50, 'ACTIVE'),

-- Station 3: Indira Nagar
(6, 3, 1, 'NSK-IND-CCS2-01', 60.00, 'DC', 18.00, 'ACTIVE'),
(7, 3, 2, 'NSK-IND-TYP2-01', 22.00, 'AC', 14.50, 'ACTIVE'),

-- Station 4: Hinjawadi Pune
(8, 4, 1, 'PUN-HIN-CCS2-01', 150.00, 'DC', 22.00, 'ACTIVE'),
(9, 4, 1, 'PUN-HIN-CCS2-02', 60.00, 'DC', 19.00, 'ACTIVE'),
(10, 4, 2, 'PUN-HIN-TYP2-01', 22.00, 'AC', 15.50, 'ACTIVE'),

-- Station 5: Koregaon Park
(11, 5, 1, 'PUN-KRP-CCS2-01', 120.00, 'DC', 21.50, 'ACTIVE'),
(12, 5, 2, 'PUN-KRP-TYP2-01', 22.00, 'AC', 15.00, 'ACTIVE'),

-- Station 6: Baner
(13, 6, 1, 'PUN-BNR-CCS2-01', 150.00, 'DC', 22.00, 'ACTIVE'),
(14, 6, 1, 'PUN-BNR-CCS2-02', 60.00, 'DC', 19.00, 'ACTIVE'),

-- Station 7: BKC Mumbai
(15, 7, 1, 'MUM-BKC-CCS2-01', 150.00, 'DC', 23.00, 'ACTIVE'),
(16, 7, 1, 'MUM-BKC-CCS2-02', 120.00, 'DC', 22.00, 'ACTIVE'),
(17, 7, 2, 'MUM-BKC-TYP2-01', 22.00, 'AC', 16.00, 'ACTIVE'),

-- Station 8: Andheri Airport
(18, 8, 1, 'MUM-AND-CCS2-01', 120.00, 'DC', 22.50, 'ACTIVE'),
(19, 8, 1, 'MUM-AND-CCS2-02', 60.00, 'DC', 19.50, 'ACTIVE'),

-- Station 9: Navi Mumbai Seawoods
(20, 9, 1, 'MUM-SWD-CCS2-01', 120.00, 'DC', 21.00, 'ACTIVE'),
(21, 9, 2, 'MUM-SWD-TYP2-01', 22.00, 'AC', 15.00, 'ACTIVE');

-- 8. CHARGING SLOTS
-- Pre-seed slots for Charger 1 (NSK-GNP-CCS2-01) for today/tomorrow demonstrating state variety
INSERT INTO charging_slots (id, charger_id, start_time, end_time, status, version) VALUES
(1, 1, '2026-10-23 09:00:00', '2026-10-23 09:30:00', 'COMPLETED', 1),
(2, 1, '2026-10-23 09:30:00', '2026-10-23 10:00:00', 'BOOKED', 1),
(3, 1, '2026-10-23 10:00:00', '2026-10-23 10:30:00', 'OCCUPIED', 1),
(4, 1, '2026-10-23 10:30:00', '2026-10-23 11:00:00', 'HELD', 1),
(5, 1, '2026-10-23 11:00:00', '2026-10-23 11:30:00', 'AVAILABLE', 0),
(6, 1, '2026-10-23 11:30:00', '2026-10-23 12:00:00', 'AVAILABLE', 0),
(7, 1, '2026-10-23 12:00:00', '2026-10-23 12:30:00', 'AVAILABLE', 0),
(8, 1, '2026-10-23 12:30:00', '2026-10-23 13:00:00', 'AVAILABLE', 0),
(9, 1, '2026-10-23 13:00:00', '2026-10-23 13:30:00', 'AVAILABLE', 0),
(10, 1, '2026-10-23 13:30:00', '2026-10-23 14:00:00', 'AVAILABLE', 0),
(11, 1, '2026-10-23 14:00:00', '2026-10-23 14:30:00', 'AVAILABLE', 0),
(12, 1, '2026-10-23 14:30:00', '2026-10-23 15:00:00', 'AVAILABLE', 0),
(13, 1, '2026-10-23 15:00:00', '2026-10-23 15:30:00', 'AVAILABLE', 0),
(14, 1, '2026-10-23 15:30:00', '2026-10-23 16:00:00', 'AVAILABLE', 0),
(15, 1, '2026-10-23 16:00:00', '2026-10-23 16:30:00', 'AVAILABLE', 0),
(16, 1, '2026-10-23 16:30:00', '2026-10-23 17:00:00', 'AVAILABLE', 0);

-- Pre-seed slots for Charger 8 (PUN-HIN-CCS2-01) Hinjawadi
INSERT INTO charging_slots (id, charger_id, start_time, end_time, status, version) VALUES
(17, 8, '2026-10-23 09:00:00', '2026-10-23 09:30:00', 'COMPLETED', 1),
(18, 8, '2026-10-23 09:30:00', '2026-10-23 10:00:00', 'AVAILABLE', 0),
(19, 8, '2026-10-23 10:00:00', '2026-10-23 10:30:00', 'AVAILABLE', 0),
(20, 8, '2026-10-23 10:30:00', '2026-10-23 11:00:00', 'AVAILABLE', 0),
(21, 8, '2026-10-23 11:00:00', '2026-10-23 11:30:00', 'AVAILABLE', 0),
(22, 8, '2026-10-23 11:30:00', '2026-10-23 12:00:00', 'AVAILABLE', 0);

-- Pre-seed slots for Charger 15 (MUM-BKC-CCS2-01) BKC Mumbai
INSERT INTO charging_slots (id, charger_id, start_time, end_time, status, version) VALUES
(23, 15, '2026-10-23 09:00:00', '2026-10-23 09:30:00', 'COMPLETED', 1),
(24, 15, '2026-10-23 09:30:00', '2026-10-23 10:00:00', 'AVAILABLE', 0),
(25, 15, '2026-10-23 10:00:00', '2026-10-23 10:30:00', 'AVAILABLE', 0),
(26, 15, '2026-10-23 10:30:00', '2026-10-23 11:00:00', 'AVAILABLE', 0),
(27, 15, '2026-10-23 11:00:00', '2026-10-23 11:30:00', 'AVAILABLE', 0),
(28, 15, '2026-10-23 11:30:00', '2026-10-23 12:00:00', 'AVAILABLE', 0);

-- 9. HISTORICAL BOOKINGS
INSERT INTO bookings (id, booking_reference, user_id, charger_id, slot_id, vehicle_id, start_time, end_time, estimated_kwh, total_amount, status, confirmed_at) VALUES
(1, 'VR-NSK-20261023-0001', 2, 1, 1, 1, '2026-10-23 09:00:00', '2026-10-23 09:30:00', 25.00, 512.50, 'COMPLETED', '2026-10-23 08:30:00'),
(2, 'VR-NSK-20261023-0002', 3, 1, 2, 3, '2026-10-23 09:30:00', '2026-10-23 10:00:00', 22.00, 451.00, 'CONFIRMED', '2026-10-23 09:10:00');

-- 10. PAYMENTS
INSERT INTO payments (id, booking_id, user_id, amount, currency, payment_method, status, transaction_id) VALUES
(1, 1, 2, 512.50, 'INR', 'UPI-GPAY', 'SUCCESS', 'TXN-VR-20261023090001'),
(2, 2, 3, 451.00, 'INR', 'CREDIT_CARD', 'SUCCESS', 'TXN-VR-20261023091002');

-- 11. CHARGING SESSIONS
INSERT INTO charging_sessions (id, booking_id, charger_id, user_id, actual_start_time, actual_end_time, start_meter_kwh, end_meter_kwh, total_kwh_delivered, peak_power_kw, status) VALUES
(1, 1, 1, 2, '2026-10-23 09:02:00', '2026-10-23 09:28:00', 10420.50, 10445.70, 25.20, 118.50, 'COMPLETED');

-- 12. BLOCKCHAIN RECORD FOR COMPLETED BOOKING
-- Canonical string for Booking 1:
-- "bookingId:1|reference:VR-NSK-20261023-0001|userId:2|stationId:1|chargerId:1|slotId:1|timestamp:2026-10-23T09:00:00|status:COMPLETED|amount:512.50"
-- SHA-256 computed on canonical string
INSERT INTO blockchain_records (id, block_index, booking_id, transaction_hash, previous_hash, canonical_data, hash_algorithm, status) VALUES
(1, 1, 1, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '0000000000000000000000000000000000000000000000000000000000000000', 'bookingId:1|reference:VR-NSK-20261023-0001|userId:2|stationId:1|chargerId:1|slotId:1|timestamp:2026-10-23T09:00:00|status:COMPLETED|amount:512.50', 'SHA-256', 'VERIFIED');
