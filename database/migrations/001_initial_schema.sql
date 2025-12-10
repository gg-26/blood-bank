-- Initial database schema for Blood Bank Management System
-- Run this after creating the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    blood_group VARCHAR(3) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    last_donation_date DATE,
    donation_count INTEGER NOT NULL DEFAULT 0,
    account_status VARCHAR(10) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive')),
    role VARCHAR(20) NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'admin', 'hospital')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_person VARCHAR(255),
    phone_number VARCHAR(20),
    capacity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood Inventory table
CREATE TABLE IF NOT EXISTS blood_inventory (
    unit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_type VARCHAR(3) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE NOT NULL,
    storage_location_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'used', 'expired')),
    donor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blood_type_needed VARCHAR(3) NOT NULL CHECK (blood_type_needed IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    units_required INTEGER NOT NULL CHECK (units_required > 0),
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    requester_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_status ON blood_inventory(status);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_expiration ON blood_inventory(expiration_date);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_hospital ON requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);

