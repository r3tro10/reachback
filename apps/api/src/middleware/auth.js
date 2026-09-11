const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'development' && process.env.AUTH_ENABLED === 'false') {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
