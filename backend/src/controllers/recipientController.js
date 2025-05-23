const Recipient = require('../models/Recipient');
const Joi = require('joi');

// Schémas de validation
const createRecipientSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis'
  }),
  firstName: Joi.string().max(100).optional().allow(''),
  lastName: Joi.string().max(100).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  company: Joi.string().max(255).optional().allow(''),
  position: Joi.string().max(255).optional().allow(''),
  tags: Joi.array().items(Joi.string()).default([]),
  notes: Joi.string().optional().allow(''),
  metadata: Joi.object().default({})
});

const updateRecipientSchema = createRecipientSchema.fork(['email'], (schema) => schema.optional()).keys({
  isActive: Joi.boolean().optional()
});

const bulkCreateSchema = Joi.array().items(createRecipientSchema);

class RecipientController {
  async create(req, res, next) {
    try {
      const { error, value } = createRecipientSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      // Vérifier si l'email existe déjà
      const existingRecipient = await Recipient.exists(req.userId, value.email);
      if (existingRecipient) {
        return res.status(409).json({
          error: 'Email already exists',
          message: 'Un destinataire avec cet email existe déjà'
        });
      }

      const recipient = await Recipient.create({
        ...value,
        userId: req.userId
      });

      res.status(201).json({
        success: true,
        message: 'Destinataire créé avec succès',
        recipient
      });

    } catch (error) {
      console.error('Create recipient error:', error);
      next(error);
    }
  }

  async bulkCreate(req, res, next) {
    try {
      const { error, value } = bulkCreateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      const recipients = await Recipient.bulkCreate(req.userId, value);

      res.status(201).json({
        success: true,
        message: `${recipients.length} destinataire(s) créé(s) avec succès`,
        recipients,
        total: recipients.length,
        skipped: value.length - recipients.length
      });

    } catch (error) {
      console.error('Bulk create recipients error:', error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        active = true,
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;

      const offset = (page - 1) * limit;
      
      const result = await Recipient.findByUserId(req.userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        active: active === 'true' ? true : active === 'false' ? false : null,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        ...result,
        page: parseInt(page),
        totalPages: Math.ceil(result.total / limit)
      });

    } catch (error) {
      console.error('Get recipients error:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const recipient = await Recipient.findById(id);
      
      if (!recipient) {
        return res.status(404).json({
          error: 'Recipient not found',
          message: 'Destinataire non trouvé'
        });
      }

      // Vérifier que le destinataire appartient à l'utilisateur
      if (recipient.user_id !== req.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Accès refusé à ce destinataire'
        });
      }

      res.json({
        success: true,
        recipient
      });

    } catch (error) {
      console.error('Get recipient by ID error:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      
      const { error, value } = updateRecipientSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      // Si l'email est modifié, vérifier qu'il n'existe pas déjà
      if (value.email) {
        const existing = await Recipient.findByEmail(req.userId, value.email);
        if (existing && existing.id !== id) {
          return res.status(409).json({
            error: 'Email already exists',
            message: 'Un autre destinataire avec cet email existe déjà'
          });
        }
      }

      const updatedRecipient = await Recipient.update(id, req.userId, value);
      
      if (!updatedRecipient) {
        return res.status(404).json({
          error: 'Recipient not found',
          message: 'Destinataire non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Destinataire mis à jour avec succès',
        recipient: updatedRecipient
      });

    } catch (error) {
      console.error('Update recipient error:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await Recipient.delete(id, req.userId);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Recipient not found',
          message: 'Destinataire non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Destinataire supprimé avec succès'
      });

    } catch (error) {
      console.error('Delete recipient error:', error);
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          error: 'Missing search term',
          message: 'Terme de recherche requis'
        });
      }

      const recipients = await Recipient.search(req.userId, searchTerm);

      res.json({
        success: true,
        recipients,
        searchTerm
      });

    } catch (error) {
      console.error('Search recipients error:', error);
      next(error);
    }
  }

  async getByTags(req, res, next) {
    try {
      const { tags } = req.query;
      
      if (!tags) {
        return res.status(400).json({
          error: 'Missing tags',
          message: 'Tags requis'
        });
      }

      const tagArray = Array.isArray(tags) ? tags : [tags];
      const recipients = await Recipient.getByTags(req.userId, tagArray);

      res.json({
        success: true,
        recipients,
        tags: tagArray
      });

    } catch (error) {
      console.error('Get recipients by tags error:', error);
      next(error);
    }
  }

  async getAllTags(req, res, next) {
    try {
      const tags = await Recipient.getAllTags(req.userId);

      res.json({
        success: true,
        tags
      });

    } catch (error) {
      console.error('Get all tags error:', error);
      next(error);
    }
  }

  async optOut(req, res, next) {
    try {
      const { id } = req.params;
      
      const recipient = await Recipient.optOut(id, req.userId);
      
      if (!recipient) {
        return res.status(404).json({
          error: 'Recipient not found',
          message: 'Destinataire non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Destinataire désabonné avec succès',
        recipient
      });

    } catch (error) {
      console.error('Opt out recipient error:', error);
      next(error);
    }
  }

  async optIn(req, res, next) {
    try {
      const { id } = req.params;
      
      const recipient = await Recipient.optIn(id, req.userId);
      
      if (!recipient) {
        return res.status(404).json({
          error: 'Recipient not found',
          message: 'Destinataire non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Destinataire réabonné avec succès',
        recipient
      });

    } catch (error) {
      console.error('Opt in recipient error:', error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await Recipient.getStats(req.userId);

      res.json({
        success: true,
        stats: {
          ...stats,
          total: parseInt(stats.total),
          active: parseInt(stats.active),
          opted_out: parseInt(stats.opted_out),
          with_company: parseInt(stats.with_company)
        }
      });

    } catch (error) {
      console.error('Get recipient stats error:', error);
      next(error);
    }
  }

  async getRecentlyAdded(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      
      const recipients = await Recipient.getRecentlyAdded(req.userId, parseInt(limit));

      res.json({
        success: true,
        recipients
      });

    } catch (error) {
      console.error('Get recently added recipients error:', error);
      next(error);
    }
  }
}

module.exports = new RecipientController();