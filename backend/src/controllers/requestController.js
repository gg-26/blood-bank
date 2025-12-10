const { Request, User, Hospital } = require('../models');
const { Op } = require('sequelize');

const URGENCY_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const computePriorityScore = (request) => {
  const urgencyScore = URGENCY_WEIGHT[request.urgency_level] || 1;
  const now = Date.now();
  const createdAtValue = request.createdAt || request.created_at;
  const createdAt = createdAtValue ? new Date(createdAtValue).getTime() : now;
  const hoursOld = Math.max(0, (now - createdAt) / (1000 * 60 * 60));

  const requester = request.requester || {};
  const donationCount = requester.donation_count || 0;
  const donationBoost = Math.min(donationCount, 5) * 0.25;

  const lastDonationValue = requester.last_donation_date || requester.lastDonationDate;
  const lastDonation = lastDonationValue ? new Date(lastDonationValue).getTime() : null;
  const recencyBoost = lastDonation
    ? 0.4 * Math.max(0, (90 - (now - lastDonation) / (1000 * 60 * 60 * 24))) / 90
    : 0;

  // Slightly reward earlier-created requests while letting donation history lift priority
  const freshnessBoost = Math.max(0, (72 - hoursOld)) / 72;

  return Number((urgencyScore + donationBoost + recencyBoost + freshnessBoost).toFixed(3));
};

/**
 * Create a blood request
 */
const createRequest = async (req, res) => {
  try {
    const { blood_type_needed, units_required, urgency_level } = req.body;

    const hospitalId = req.user.role === 'hospital'
      ? req.user.user_id
      : req.body.hospital_id || req.user.user_id; // fallback for donor/self-request

    const request = await Request.create({
      hospital_id: hospitalId,
      blood_type_needed,
      units_required,
      urgency_level: urgency_level || 'medium',
      status: 'pending',
      requester_id: req.user.role === 'donor' ? req.user.user_id : (req.body.requester_id || null)
    });

    const requestWithDetails = await Request.findByPk(request.request_id, {
      include: [
        {
          model: User,
          as: 'hospital',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['name', 'email', 'donation_count', 'last_donation_date', 'blood_group']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      request: requestWithDetails
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request', message: error.message });
  }
};

/**
 * Get all requests (filtered by role)
 */
const getRequests = async (req, res) => {
  try {
    const { status, urgency_level, blood_type_needed } = req.query;
    const where = {};

    // Donors see only their own; hospitals and admins see all (so hospitals can view donor-originated requests)
    if (req.user.role === 'donor') {
      where.requester_id = req.user.user_id;
    }

    if (status) where.status = status;
    if (urgency_level) where.urgency_level = urgency_level;
    if (blood_type_needed) where.blood_type_needed = blood_type_needed;

    const requests = await Request.findAll({
      where,
      include: [
        {
          model: User,
          as: 'hospital',
          attributes: ['name', 'email', 'phone', 'latitude', 'longitude']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['name', 'email', 'blood_group', 'donation_count', 'last_donation_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const requestsWithPriority = requests
      .map(reqItem => {
        const priority_score = computePriorityScore(reqItem);
        return { ...reqItem.toJSON(), priority_score };
      })
      .sort((a, b) => b.priority_score - a.priority_score);

    res.json({
      success: true,
      count: requestsWithPriority.length,
      requests: requestsWithPriority
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
  }
};

/**
 * Get request by ID
 */
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findByPk(id, {
      include: [
        {
          model: User,
          as: 'hospital',
          attributes: ['name', 'email', 'phone', 'latitude', 'longitude']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['name', 'email', 'blood_group', 'donation_count', 'last_donation_date']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check permissions
    if (req.user.role === 'hospital' && request.hospital_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'donor' && request.requester_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      request: {
        ...request.toJSON(),
        priority_score: computePriorityScore(request)
      }
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request', message: error.message });
  }
};

/**
 * Update request status
 */
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check permissions
    if (req.user.role === 'hospital' && request.hospital_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'donor' && request.requester_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    request.status = status;
    if (status === 'fulfilled') {
      request.fulfilled_at = new Date();
    }
    await request.save();

    res.json({
      success: true,
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request', message: error.message });
  }
};

/**
 * Fulfill a request
 */
const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_ids } = req.body; // Array of blood unit IDs to use

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({ error: 'Request already fulfilled' });
    }

    // For demo purposes, allow fulfilling without specifying blood units.
    // If no unit_ids are provided, simply mark the request as fulfilled.
    if (Array.isArray(unit_ids) && unit_ids.length > 0) {
      // Verify units exist and are available
      const { BloodInventory } = require('../models');
      const units = await BloodInventory.findAll({
        where: {
          unit_id: { [Op.in]: unit_ids },
          status: 'available',
          blood_type: request.blood_type_needed
        }
      });

      // In a real system we would enforce units.length >= units_required,
      // but for a classroom demo we just update whatever units are passed.
      if (units.length > 0) {
        await BloodInventory.update(
          { status: 'used' },
          { where: { unit_id: { [Op.in]: unit_ids } } }
        );
      }
    }

    // Update request status
    request.status = 'fulfilled';
    request.fulfilled_at = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Request fulfilled successfully',
      request
    });
  } catch (error) {
    console.error('Fulfill request error:', error);
    res.status(500).json({ error: 'Failed to fulfill request', message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  fulfillRequest,
  computePriorityScore // exported for tests
};

