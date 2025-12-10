const { User } = require('../models');

/**
 * Get donor stats (for prioritization)
 */
const getDonorStats = async (req, res) => {
  try {
    const donors = await User.findAll({
      where: { role: 'donor' },
      attributes: [
        'user_id',
        'name',
        'email',
        'phone',
        'blood_group',
        'donation_count',
        'last_donation_date'
      ],
      order: [
        ['donation_count', 'DESC'],
        ['last_donation_date', 'DESC NULLS LAST']
      ]
    });

    res.json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch donor stats', message: error.message });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, blood_group, latitude, longitude, last_donation_date } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (blood_group) user.blood_group = blood_group;
    const latVal = latitude === '' ? null : latitude;
    const lonVal = longitude === '' ? null : longitude;

    if (latVal !== undefined) {
      user.latitude = latVal === null ? null : parseFloat(latVal);
    }
    if (lonVal !== undefined) {
      user.longitude = lonVal === null ? null : parseFloat(lonVal);
    }
    if (last_donation_date) user.last_donation_date = last_donation_date;

    await user.save();

    const updatedUser = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', message: error.message });
  }
};

/**
 * Get user by ID (admin/hospital only)
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, account_status } = req.query;
    
    const where = {};
    if (role) where.role = role;
    if (account_status) where.account_status = account_status;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserById,
  getAllUsers,
  getDonorStats
};

