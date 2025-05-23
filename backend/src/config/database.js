const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuration de la base de données avec des valeurs par défaut
const dbConfig = {
  database: process.env.DB_NAME || 'eventsync',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rajae19',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432
};

// Vérification des variables d'environnement
logger.info('Configuration de la base de données:', {
  database: dbConfig.database,
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.username
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: (msg) => logger.debug('Sequelize:', msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test de la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connexion à PostgreSQL établie avec succès.', {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username
    });
  } catch (error) {
    logger.error('Impossible de se connecter à PostgreSQL:', {
      error: error.message,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username
    });
    throw error;
  }
};

// Synchronisation des modèles avec la base de données
const syncDatabase = async () => {
  try {
    // Force la suppression et recréation des tables
    await sequelize.sync({ force: true });
    logger.info('Base de données synchronisée avec succès.');
  } catch (error) {
    logger.error('Erreur lors de la synchronisation de la base de données:', {
      error: error.message
    });
    throw error;
  }
};

// Initialisation
const initDatabase = async () => {
  try {
    await testConnection();
    await syncDatabase();
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', {
      error: error.message
    });
    process.exit(1);
  }
};

initDatabase();

module.exports = sequelize;