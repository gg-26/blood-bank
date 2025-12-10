const User = require('./User');
const Hospital = require('./Hospital');
const BloodInventory = require('./BloodInventory');
const Request = require('./Request');

// Define relationships
// Note: Hospital is a separate entity, not directly linked to User
// Hospital users are identified by role='hospital' in User table

// Hospital to BloodInventory (one-to-many)
Hospital.hasMany(BloodInventory, {
  foreignKey: 'storage_location_id',
  as: 'inventory'
});

BloodInventory.belongsTo(Hospital, {
  foreignKey: 'storage_location_id',
  as: 'hospital'
});

// User to BloodInventory (donor relationship)
User.hasMany(BloodInventory, {
  foreignKey: 'donor_id',
  as: 'donations'
});

BloodInventory.belongsTo(User, {
  foreignKey: 'donor_id',
  as: 'donor'
});

// User to Request (hospital makes requests)
User.hasMany(Request, {
  foreignKey: 'hospital_id',
  as: 'requests'
});

Request.belongsTo(User, {
  foreignKey: 'hospital_id',
  as: 'hospital'
});

// Requester (a donor or any user requesting blood)
User.hasMany(Request, {
  foreignKey: 'requester_id',
  as: 'requested_blood'
});

Request.belongsTo(User, {
  foreignKey: 'requester_id',
  as: 'requester'
});

module.exports = {
  User,
  Hospital,
  BloodInventory,
  Request
};

