const { BloodInventory, Hospital, User } = require('../models');
const { Op } = require('sequelize');
const { sendLowStockAlert, sendExpiringUnitsAlert } = require('./emailService');

/**
 * Check and send low stock alerts
 */
const checkLowStock = async (threshold = 10) => {
  try {
    const inventory = await BloodInventory.findAll({
      where: {
        status: 'available'
      },
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['hospital_id', 'hospital_name', 'user_id']
        }
      ]
    });

    // Count units by blood type and hospital
    const stockCounts = {};
    inventory.forEach(unit => {
      const key = `${unit.blood_type}_${unit.storage_location_id}`;
      stockCounts[key] = (stockCounts[key] || 0) + 1;
    });

    // Find low stock items and send alerts
    const alerts = [];
    for (const [key, count] of Object.entries(stockCounts)) {
      if (count < threshold) {
        const [blood_type, hospital_id] = key.split('_');
        const hospital = inventory.find(u => 
          u.storage_location_id === hospital_id && u.blood_type === blood_type
        )?.hospital;
        
        if (hospital && hospital.user_id) {
          const hospitalUser = await User.findByPk(hospital.user_id);
          if (hospitalUser && hospitalUser.email) {
            await sendLowStockAlert(
              hospitalUser.email,
              hospital.hospital_name,
              blood_type,
              count,
              threshold
            );
            alerts.push({ hospital: hospital.hospital_name, blood_type, count });
          }
        }
      }
    }

    console.log(`Low stock alerts sent: ${alerts.length}`);
    return alerts;
  } catch (error) {
    console.error('Check low stock error:', error);
    return [];
  }
};

/**
 * Check and send expiring units alerts
 */
const checkExpiringUnits = async () => {
  try {
    const today = new Date();
    const expirationThreshold = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const expiringUnits = await BloodInventory.findAll({
      where: {
        expiration_date: {
          [Op.between]: [today, expirationThreshold]
        },
        status: 'available'
      },
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['hospital_id', 'hospital_name', 'user_id']
        }
      ]
    });

    // Group by hospital
    const unitsByHospital = {};
    expiringUnits.forEach(unit => {
      const hospitalId = unit.storage_location_id;
      if (!unitsByHospital[hospitalId]) {
        unitsByHospital[hospitalId] = {
          hospital: unit.hospital,
          units: []
        };
      }
      unitsByHospital[hospitalId].units.push(unit);
    });

    // Send alerts to each hospital
    const alerts = [];
    for (const [hospitalId, data] of Object.entries(unitsByHospital)) {
      if (data.hospital && data.hospital.user_id) {
        const hospitalUser = await User.findByPk(data.hospital.user_id);
        if (hospitalUser && hospitalUser.email) {
          await sendExpiringUnitsAlert(
            hospitalUser.email,
            data.hospital.hospital_name,
            data.units
          );
          alerts.push({ 
            hospital: data.hospital.hospital_name, 
            count: data.units.length 
          });
        }
      }
    }

    console.log(`Expiring units alerts sent: ${alerts.length}`);
    return alerts;
  } catch (error) {
    console.error('Check expiring units error:', error);
    return [];
  }
};

/**
 * Run all alert checks
 */
const runAlerts = async () => {
  console.log('Running alert checks...');
  await checkLowStock();
  await checkExpiringUnits();
  console.log('Alert checks completed');
};

module.exports = {
  checkLowStock,
  checkExpiringUnits,
  runAlerts
};

