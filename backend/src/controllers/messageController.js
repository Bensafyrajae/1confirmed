const Message = require('../models/Message');
const Joi = require('joi');

// Schémas de validation
const createMessageSchema = Joi.object({
  eventId: Joi.string().uuid().optional().allow(null),
  subject: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Le sujet ne peut pas être vide',
    'string.max': 'Le sujet ne peut pas dépasser 500 caractères',
    'any.required': 'Le sujet est requis'
  }),
  content: Joi.string().min(1).required().messages({
    'string.min': 'Le contenu ne peut pas être vide',
    'any.required': 'Le contenu est requis'
  }),
  messageType: Joi.string().valid('email', 'sms', 'push').default('email'),
  scheduledAt: Joi.date().iso().greater('now').optional(),
  metadata: Joi.object().default({})
});

const updateMessageSchema = createMessageSchema.fork(['subject', 'content'], (schema) => schema.optional()).keys({
  status: Joi.string().valid('draft', 'scheduled', 'sending', 'sent', 'failed').optional()
});

const sendMessageSchema = Joi.object({
  recipientIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'Au moins un destinataire est requis',
    'any.required': 'Liste des destinataires requise'
  })
});

class MessageController {
  async create(req, res, next) {
    try {
      const { error, value } = createMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      const message = await Message.create({
        ...value,
        userId: req.userId
      });

      res.status(201).json({
        success: true,
        message: 'Message créé avec succès',
        data: message
      });

    } catch (error) {
      console.error('Create message error:', error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        eventId,
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;

      const offset = (page - 1) * limit;
      
      const result = await Message.findByUserId(req.userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        eventId,
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
      console.error('Get messages error:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const message = await Message.findById(id);
      
      if (!message) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé'
        });
      }

      // Vérifier que le message appartient à l'utilisateur
      if (message.user_id !== req.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Accès refusé à ce message'
        });
      }

      // Récupérer les envois si le message a été envoyé
      let sends = [];
      if (message.status === 'sent' || message.status === 'sending') {
        sends = await Message.getSends(id);
      }

      res.json({
        success: true,
        data: {
          ...message,
          sends
        }
      });

    } catch (error) {
      console.error('Get message by ID error:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      
      const { error, value } = updateMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      // Vérifier que le message existe et appartient à l'utilisateur
      const existingMessage = await Message.findById(id);
      if (!existingMessage || existingMessage.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      // Ne pas permettre la modification d'un message déjà envoyé
      if (existingMessage.status === 'sent') {
        return res.status(400).json({
          error: 'Cannot modify sent message',
          message: 'Impossible de modifier un message déjà envoyé'
        });
      }

      const updatedMessage = await Message.update(id, req.userId, value);
      
      if (!updatedMessage) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Message mis à jour avec succès',
        data: updatedMessage
      });

    } catch (error) {
      console.error('Update message error:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      // Vérifier que le message existe et appartient à l'utilisateur
      const existingMessage = await Message.findById(id);
      if (!existingMessage || existingMessage.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      // Ne pas permettre la suppression d'un message en cours d'envoi
      if (existingMessage.status === 'sending') {
        return res.status(400).json({
          error: 'Cannot delete message being sent',
          message: 'Impossible de supprimer un message en cours d\'envoi'
        });
      }

      const deleted = await Message.delete(id, req.userId);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Message supprimé avec succès'
      });

    } catch (error) {
      console.error('Delete message error:', error);
      next(error);
    }
  }

  async send(req, res, next) {
    try {
      const { id } = req.params;
      
      const { error, value } = sendMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      // Vérifier que le message existe et appartient à l'utilisateur
      const message = await Message.findById(id);
      if (!message || message.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      // Vérifier que le message peut être envoyé
      if (message.status !== 'draft' && message.status !== 'scheduled') {
        return res.status(400).json({
          error: 'Message already sent',
          message: 'Ce message a déjà été envoyé'
        });
      }

      await Message.send(id, value.recipientIds);

      res.json({
        success: true,
        message: 'Message envoyé avec succès',
        recipientCount: value.recipientIds.length
      });

    } catch (error) {
      console.error('Send message error:', error);
      next(error);
    }
  }

  async schedule(req, res, next) {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body;

      if (!scheduledAt) {
        return res.status(400).json({
          error: 'Missing scheduled date',
          message: 'Date de programmation requise'
        });
      }

      // Vérifier que la date est dans le futur
      if (new Date(scheduledAt) <= new Date()) {
        return res.status(400).json({
          error: 'Invalid scheduled date',
          message: 'La date de programmation doit être dans le futur'
        });
      }

      // Vérifier que le message existe et appartient à l'utilisateur
      const message = await Message.findById(id);
      if (!message || message.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      const scheduledMessage = await Message.schedule(id, scheduledAt);

      res.json({
        success: true,
        message: 'Message programmé avec succès',
        data: scheduledMessage
      });

    } catch (error) {
      console.error('Schedule message error:', error);
      next(error);
    }
  }

  async getSends(req, res, next) {
    try {
      const { id } = req.params;

      // Vérifier que le message existe et appartient à l'utilisateur
      const message = await Message.findById(id);
      if (!message || message.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Message not found',
          message: 'Message non trouvé ou accès refusé'
        });
      }

      const sends = await Message.getSends(id);

      res.json({
        success: true,
        sends
      });

    } catch (error) {
      console.error('Get message sends error:', error);
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

      const messages = await Message.search(req.userId, searchTerm);

      res.json({
        success: true,
        messages,
        searchTerm
      });

    } catch (error) {
      console.error('Search messages error:', error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await Message.getStats(req.userId);

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Get message stats error:', error);
      next(error);
    }
  }

  async getByEvent(req, res, next) {
    try {
      const { eventId } = req.params;

      const messages = await Message.getByEvent(eventId, req.userId);

      res.json({
        success: true,
        messages
      });

    } catch (error) {
      console.error('Get messages by event error:', error);
      next(error);
    }
  }
}

module.exports = new MessageController();