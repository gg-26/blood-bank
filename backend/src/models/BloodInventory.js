const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BloodInventory = sequelize.define('BloodInventory', {
  unit_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    allowNull: false
  },
  collection_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiration_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  storage_location_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'hospital_id'
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'used', 'expired'),
    defaultValue: 'available'
  },
  donor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'blood_inventory',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (unit) => {
      // Set expiration date to 42 days from collection if not provided
      if (!unit.expiration_date && unit.collection_date) {
        const expiration = new Date(unit.collection_date);
        expiration.setDate(expiration.getDate() + 42);
        unit.expiration_date = expiration;
      }

      // Increment donor history when donor_id is present
      if (unit.donor_id) {
        const UserModel = sequelize.models.User;
        if (UserModel) {
          await UserModel.increment(
            { donation_count: 1 },
            { where: { user_id: unit.donor_id } }
          );
          await UserModel.update(
            { last_donation_date: unit.collection_date || new Date() },
            { where: { user_id: unit.donor_id } }
          );
        }
      }
    }
  }
});

module.exports = BloodInventory;

