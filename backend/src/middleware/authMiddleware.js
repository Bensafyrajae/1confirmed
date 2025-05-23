const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Format de token invalide'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Token expiré'
      });
    }
    
    return res.status(500).json({
      error: 'Token verification failed',
      message: 'Erreur lors de la vérification du token'
    });
  }
};

// Middleware optionnel (pour les routes qui peuvent être accessibles avec ou sans auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);
    
    if (user) {
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.user = user;
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};