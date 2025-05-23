const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const Joi = require('joi');

// Schémas de validation
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Mot de passe requis'
  }),
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
  companyName: Joi.string().optional().allow('')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mot de passe requis'
  })
});

class AuthController {
  async register(req, res, next) {
    try {
      // Validation des données
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      const { email, password, firstName, lastName, companyName } = value;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.exists(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already registered',
          message: 'Cet email est déjà utilisé'
        });
      }

      // Créer l'utilisateur
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        companyName
      });

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Réponse sans le mot de passe
      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          companyName: user.company_name
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Validation des données
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message
        });
      }

      const { email, password } = value;

      // Chercher l'utilisateur
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Réponse sans le mot de passe
      res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          companyName: user.company_name
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          companyName: user.company_name
        }
      });

    } catch (error) {
      console.error('Me endpoint error:', error);
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, companyName } = req.body;

      const updatedUser = await User.update(req.userId, {
        firstName,
        lastName,
        companyName
      });

      if (!updatedUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          companyName: updatedUser.company_name
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Mot de passe actuel et nouveau mot de passe requis'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        });
      }

      const user = await User.findByEmail(req.user.email);
      const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid current password',
          message: 'Mot de passe actuel incorrect'
        });
      }

      await User.updatePassword(req.userId, newPassword);

      res.json({
        success: true,
        message: 'Mot de passe mis à jour avec succès'
      });

    } catch (error) {
      console.error('Change password error:', error);
      next(error);
    }
  }

  async logout(req, res) {
    // Avec JWT, la déconnexion se fait côté client
    // Ici on peut ajouter une blacklist des tokens si nécessaire
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  }
}

module.exports = new AuthController();