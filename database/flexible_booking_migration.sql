-- Migration for Vehicle-Aware and Flexible Charging Booking

ALTER TABLE voltreserve.vehicles 
    ADD COLUMN vehicle_type VARCHAR(30) DEFAULT 'CAR',
    ADD COLUMN max_ac_charging_rate_kw DECIMAL(6,2) DEFAULT 7.40,
    ADD COLUMN max_dc_charging_rate_kw DECIMAL(6,2) DEFAULT 50.00,
    ADD COLUMN current_soc_percentage DECIMAL(5,2) DEFAULT 25.00,
    ADD COLUMN estimated_range_km DECIMAL(6,2) DEFAULT 120.00,
    ADD COLUMN energy_consumption_wh_per_km DECIMAL(6,2) DEFAULT 140.00,
    ADD COLUMN is_default BOOLEAN DEFAULT FALSE;

ALTER TABLE voltreserve.bookings 
    MODIFY slot_id BIGINT NULL,
    ADD COLUMN target_soc_percentage DECIMAL(5,2) DEFAULT 80.00,
    ADD COLUMN initial_soc_percentage DECIMAL(5,2) DEFAULT 25.00,
    ADD COLUMN charging_duration_minutes INT DEFAULT 45,
    ADD COLUMN tariff_snapshot DECIMAL(8,2) DEFAULT 18.50,
    ADD COLUMN base_amount DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN gst_amount DECIMAL(10,2) DEFAULT NULL,
    ADD COLUMN platform_fee DECIMAL(10,2) DEFAULT 15.00;

-- Update existing vehicles so the first vehicle of each user is marked as default
UPDATE voltreserve.vehicles v
JOIN (
    SELECT MIN(id) as min_id, user_id FROM voltreserve.vehicles GROUP BY user_id
) sub ON v.id = sub.min_id
SET v.is_default = TRUE;
