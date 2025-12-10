const { BloodInventory, Hospital } = require('../models');
const { Op } = require('sequelize');

/**
 * Get blood inventory (filtered by hospital for hospital users)
 */
const getInventory = async (req, res) => {
  try {
    const { hospital_id, blood_type, status } = req.query;
    const where = {};

    // Filter by hospital_id if provided
    if (hospital_id) {
      where.storage_location_id = hospital_id;
    }

    if (blood_type) where.blood_type = blood_type;
    if (status) where.status = status;

    const inventory = await BloodInventory.findAll({
      where,
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['hospital_name', 'address']
        },
        {
          model: require('../models').User,
          as: 'donor',
          attributes: ['name', 'blood_group']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory', message: error.message });
  }
};

/**
 * Add blood unit to inventory
 */
const addBloodUnit = async (req, res) => {
  try {
    const { blood_type, collection_date, expiration_date, storage_location_id, donor_id, units = 1 } = req.body;

    // Resolve storage location.
    // For the classroom demo, if no storage_location_id is provided,
    // automatically map the current hospital user to a Hospital record.
    let storageLocationId = storage_location_id;

    if (!storageLocationId) {
      try {
        // Try to find a hospital with a name matching the user's name.
        let hospital = await Hospital.findOne({
          where: { hospital_name: req.user?.name }
        });

        // If none exists, create a simple hospital entry for this user.
        if (!hospital) {
          hospital = await Hospital.create({
            hospital_name: req.user?.name || 'Demo Hospital',
            address: 'Demo address',
            latitude: req.user?.latitude || 28.6139,   // default: Delhi
            longitude: req.user?.longitude || 77.2090,
            contact_person: req.user?.name || 'Hospital Admin',
            phone_number: req.user?.phone || '0000000000',
            capacity: 500
          });
        }

        storageLocationId = hospital.hospital_id;
      } catch (e) {
        console.error('Failed to resolve hospital for inventory unit:', e);
        return res.status(500).json({ error: 'Failed to resolve storage location' });
      }
    }

    const collectionDateValue = collection_date ? new Date(collection_date) : new Date();
    const expirationDateValue = expiration_date
      ? new Date(expiration_date)
      : new Date(collectionDateValue.getTime() + 42 * 24 * 60 * 60 * 1000); // default 42 days

    const createdUnits = [];
    for (let i = 0; i < Math.max(1, units); i++) {
      const bloodUnit = await BloodInventory.create({
        blood_type,
        collection_date: collectionDateValue,
        expiration_date: expirationDateValue,
        storage_location_id: storageLocationId,
        donor_id,
        status: 'available'
      });

      const unitWithDetails = await BloodInventory.findByPk(bloodUnit.unit_id, {
        include: [
          {
            model: Hospital,
            as: 'hospital',
            attributes: ['hospital_name']
          }
        ]
      });
      createdUnits.push(unitWithDetails);
    }

    res.status(201).json({
      success: true,
      message: 'Blood unit(s) added successfully',
      count: createdUnits.length,
      units: createdUnits
    });
  } catch (error) {
    console.error('Add blood unit error:', error);
    res.status(500).json({ error: 'Failed to add blood unit', message: error.message });
  }
};

/**
 * Update blood unit status
 */
const updateBloodUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const unit = await BloodInventory.findByPk(id);
    if (!unit) {
      return res.status(404).json({ error: 'Blood unit not found' });
    }

    // Check permissions for hospital users (if hospital_id filtering is needed)
    // This can be enhanced based on your business logic

    unit.status = status;
    await unit.save();

    res.json({
      success: true,
      message: 'Blood unit updated successfully',
      unit
    });
  } catch (error) {
    console.error('Update blood unit error:', error);
    res.status(500).json({ error: 'Failed to update blood unit', message: error.message });
  }
};

/**
 * Get expiring blood units (within 7 days)
 */
const getExpiringUnits = async (req, res) => {
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
          attributes: ['hospital_name', 'address']
        }
      ],
      order: [['expiration_date', 'ASC']]
    });

    res.json({
      success: true,
      count: expiringUnits.length,
      units: expiringUnits
    });
  } catch (error) {
    console.error('Get expiring units error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring units', message: error.message });
  }
};

/**
 * Get low stock alerts
 */
const getLowStock = async (req, res) => {
  try {
    const { threshold = 10 } = req.query; // Default threshold: 10 units

    // Group by blood type and hospital
    const inventory = await BloodInventory.findAll({
      where: {
        status: 'available'
      },
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['hospital_id', 'hospital_name']
        }
      ]
    });

    // Count units by blood type and hospital
    const stockCounts = {};
    inventory.forEach(unit => {
      const key = `${unit.blood_type}_${unit.storage_location_id}`;
      stockCounts[key] = (stockCounts[key] || 0) + 1;
    });

    // Find low stock items
    const lowStock = [];
    for (const [key, count] of Object.entries(stockCounts)) {
      if (count < threshold) {
        const [blood_type, hospital_id] = key.split('_');
        const hospital = inventory.find(u => 
          u.storage_location_id === hospital_id && u.blood_type === blood_type
        )?.hospital;
        
        lowStock.push({
          blood_type,
          hospital_id,
          hospital_name: hospital?.hospital_name,
          current_stock: count,
          threshold
        });
      }
    }

    res.json({
      success: true,
      count: lowStock.length,
      low_stock: lowStock
    });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock', message: error.message });
  }
};

module.exports = {
  getInventory,
  addBloodUnit,
  updateBloodUnit,
  getExpiringUnits,
  getLowStock
};

