const config = require('../config');

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Données invalides',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Token expiré'
    });
  }

  // Erreurs de base de données PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate Entry',
          message: 'Cette entrée existe déjà',
          field: err.detail
        });
      
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Reference Error',
          message: 'Référence invalide'
        });
      
      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Missing Required Field',
          message: 'Champ requis manquant'
        });
      
      case '42P01': // Undefined table
        return res.status(500).json({
          error: 'Database Error',
          message: 'Erreur de configuration de la base de données'
        });
      
      case 'ECONNREFUSED':
        return res.status(500).json({
          error: 'Database Connection Error',
          message: 'Impossible de se connecter à la base de données'
        });
    }
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Format JSON invalide'
    });
  }

  // Erreurs de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'Fichier trop volumineux'
    });
  }

  // Erreurs personnalisées avec status
  if (err.status) {
    return res.status(err.status).json({
      error: err.name || 'Custom Error',
      message: err.message
    });
  }

  // Erreur par défaut
  const status = err.statusCode || err.status || 500;
  const message = config.nodeEnv === 'production' 
    ? 'Erreur interne du serveur' 
    : err.message;

  res.status(status).json({
    error: 'Internal Server Error',
    message,
    ...(config.nodeEnv !== 'production' && { 
      stack: err.stack,
      details: err 
    })
  });
};

// Middleware pour les erreurs 404
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
};

// Middleware pour les erreurs async/await
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};