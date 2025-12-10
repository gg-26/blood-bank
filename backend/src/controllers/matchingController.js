const { User } = require('../models');
const { haversineDistance } = require('../utils/haversine');
const { getCompatibleDonorTypes } = require('../utils/bloodCompatibility');

/**
 * Find nearby donors for a blood request
 */
const findNearbyDonors = async (req, res) => {
  try {
    const { hospitalLat, hospitalLon, bloodType, radius = 10 } = req.body;

    if (!hospitalLat || !hospitalLon || !bloodType) {
      return res.status(400).json({ 
        error: 'Missing required fields: hospitalLat, hospitalLon, bloodType' 
      });
    }

    // Get compatible donor blood types
    const compatibleDonorTypes = getCompatibleDonorTypes(bloodType);

    // Find all active donors with compatible blood types
    const donors = await User.findAll({
      where: {
        role: 'donor',
        account_status: 'active',
        blood_group: { [require('sequelize').Op.in]: compatibleDonorTypes },
        latitude: { [require('sequelize').Op.not]: null },
        longitude: { [require('sequelize').Op.not]: null }
      },
      attributes: {
        exclude: ['password_hash']
      }
    });

    // Calculate distances and filter by radius
    const nearbyDonors = donors
      .map(donor => {
        const distance = haversineDistance(
          parseFloat(hospitalLat),
          parseFloat(hospitalLon),
          parseFloat(donor.latitude),
          parseFloat(donor.longitude)
        );
        return {
          ...donor.toJSON(),
          distance: parseFloat(distance.toFixed(2))
        };
      })
      .filter(donor => donor.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // Top 20 closest

    res.json({
      success: true,
      count: nearbyDonors.length,
      radius_km: radius,
      donors: nearbyDonors
    });
  } catch (error) {
    console.error('Find nearby donors error:', error);
    res.status(500).json({ error: 'Failed to find nearby donors', message: error.message });
  }
};

/**
 * Get matching suggestions for a request
 */
const getMatchingSuggestions = async (req, res) => {
  try {
    const { requestId } = req.params;

    const { Request, User: UserModel } = require('../models');
    const request = await Request.findByPk(requestId, {
      include: [
        {
          model: UserModel,
          as: 'hospital',
          attributes: ['latitude', 'longitude']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!request.hospital.latitude || !request.hospital.longitude) {
      return res.status(400).json({ error: 'Hospital location not set' });
    }

    // Find nearby compatible donors
    const compatibleDonorTypes = getCompatibleDonorTypes(request.blood_type_needed);
    const donors = await User.findAll({
      where: {
        role: 'donor',
        account_status: 'active',
        blood_group: { [require('sequelize').Op.in]: compatibleDonorTypes },
        latitude: { [require('sequelize').Op.not]: null },
        longitude: { [require('sequelize').Op.not]: null }
      },
      attributes: {
        exclude: ['password_hash']
      }
    });

    // Calculate distances and sort
    const suggestions = donors
      .map(donor => {
        const distance = haversineDistance(
          parseFloat(request.hospital.latitude),
          parseFloat(request.hospital.longitude),
          parseFloat(donor.latitude),
          parseFloat(donor.longitude)
        );
        return {
          ...donor.toJSON(),
          distance: parseFloat(distance.toFixed(2)),
          compatibility: 'compatible'
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    res.json({
      success: true,
      request: {
        request_id: request.request_id,
        blood_type_needed: request.blood_type_needed,
        units_required: request.units_required,
        urgency_level: request.urgency_level
      },
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Get matching suggestions error:', error);
    res.status(500).json({ error: 'Failed to get matching suggestions', message: error.message });
  }
};

module.exports = {
  findNearbyDonors,
  getMatchingSuggestions
};

