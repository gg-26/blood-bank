/**
 * Middleware to authorize users based on roles
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is admin
 * Useful for hospital users to only access their own data
 */
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admins can access everything
  if (req.user.role === 'admin') {
    return next();
  }

  // For hospital users, check if they're accessing their own data
  const resourceUserId = req.params.userId || req.params.hospitalId || req.body.hospital_id;
  
  if (resourceUserId && resourceUserId !== req.user.user_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to this resource' });
  }

  next();
};

module.exports = { authorize, authorizeOwnerOrAdmin };

