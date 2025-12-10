export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const ROLES = {
  DONOR: 'donor',
  HOSPITAL: 'hospital',
  ADMIN: 'admin'
};

export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'];

export const INVENTORY_STATUS = ['available', 'reserved', 'used', 'expired'];

export const REQUEST_STATUS = ['pending', 'fulfilled', 'cancelled'];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

