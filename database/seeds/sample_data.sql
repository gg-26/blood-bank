-- WARNING: This is for development only. Do not use in production.

-- All passwords below use the same bcrypt hash for: password123
-- Hash is a placeholder; in production, generate real hashes per user.

-- Minimal seed: 1 donor + 1 hospital (Dehradun)
INSERT INTO users (
  user_id, name, email, phone, password_hash, blood_group, latitude, longitude,
  last_donation_date, donation_count, role, account_status, created_at, updated_at
) VALUES 
  (uuid_generate_v4(), 'Dehradun Donor', 'donor@example.in', '9000000001', '$2b$10$4ij80m8tTT7UiHW2PZNIQOXrdq6P8H74ZZuDVTtRdMih97sBj6qqy', 'O+', 30.3165, 78.0322, '2024-11-15', 1, 'donor', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'AIIMS Dehradun Admin', 'aiims.dehradun@example.in', '9000000002', '$2b$10$4ij80m8tTT7UiHW2PZNIQOXrdq6P8H74ZZuDVTtRdMih97sBj6qqy', NULL, 30.3165, 78.0322, NULL, 0, 'hospital', 'active', NOW(), NOW());

-- Hospital record for the hospital user
INSERT INTO hospitals (hospital_id, hospital_name, address, latitude, longitude, contact_person, phone_number, capacity, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'AIIMS Dehradun', 'Dehradun, Uttarakhand', 30.3165, 78.0322, 'Dr. Admin', '01352600000', 500, NOW(), NOW());

-- Default password for ALL users created here: password123
