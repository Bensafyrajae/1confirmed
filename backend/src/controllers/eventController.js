const Event = require('../models/Event');
const Joi = require('joi');

// Schémas de validation
const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Le titre doit contenir au moins 3 caractères',
    'string.max': 'Le titre ne peut pas dépasser 255 caractères',
    'any.required': 'Le titre est requis'
  }),
  description: Joi.string().optional().allow(''),
  eventDate: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'La date de l\'événement doit être dans le futur',
    'any.required': 'La date de l\'événement est requise'
  }),
  location: Joi.string().max(500).optional().allow(''),
  status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').default('draft'),
  maxParticipants: Joi.number().integer().min(1).optional(),
  isPublic: Joi.boolean().default(false),
  registrationDeadline: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  metadata: Joi.object().default({})
});

const updateEventSchema = createEventSchema.fork(['title', 'eventDate'], (schema) => schema.optional());

class EventController {
  async create(req, res, next) {
    try {
      const { error, value } = createEventSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      const event = await Event.create({
        ...value,
        userId: req.userId
      });

      res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        event
      });

    } catch (error) {
      console.error('Create event error:', error);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;

      const offset = (page - 1) * limit;
      
      const result = await Event.findByUserId(req.userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
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
      console.error('Get events error:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Événement non trouvé'
        });
      }

      // Vérifier que l'événement appartient à l'utilisateur
      if (event.user_id !== req.userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Accès refusé à cet événement'
        });
      }

      // Récupérer les participants
      const participants = await Event.getParticipants(id);

      res.json({
        success: true,
        event: {
          ...event,
          participants
        }
      });

    } catch (error) {
      console.error('Get event by ID error:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      
      const { error, value } = updateEventSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
          details: error.details
        });
      }

      const updatedEvent = await Event.update(id, req.userId, value);
      
      if (!updatedEvent) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Événement non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Événement mis à jour avec succès',
        event: updatedEvent
      });

    } catch (error) {
      console.error('Update event error:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await Event.delete(id, req.userId);
      
      if (!deleted) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Événement non trouvé ou accès refusé'
        });
      }

      res.json({
        success: true,
        message: 'Événement supprimé avec succès'
      });

    } catch (error) {
      console.error('Delete event error:', error);
      next(error);
    }
  }

  async addParticipant(req, res, next) {
    try {
      const { id } = req.params;
      const { recipientId, status = 'invited' } = req.body;

      if (!recipientId) {
        return res.status(400).json({
          error: 'Missing recipientId',
          message: 'ID du destinataire requis'
        });
      }

      // Vérifier que l'événement appartient à l'utilisateur
      const event = await Event.findById(id);
      if (!event || event.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Événement non trouvé ou accès refusé'
        });
      }

      const participant = await Event.addParticipant(id, recipientId, status);

      res.json({
        success: true,
        message: 'Participant ajouté avec succès',
        participant
      });

    } catch (error) {
      console.error('Add participant error:', error);
      next(error);
    }
  }

  async removeParticipant(req, res, next) {
    try {
      const { id, recipientId } = req.params;

      // Vérifier que l'événement appartient à l'utilisateur
      const event = await Event.findById(id);
      if (!event || event.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Événement non trouvé ou accès refusé'
        });
      }

      const removed = await Event.removeParticipant(id, recipientId);

      if (!removed) {
        return res.status(404).json({
          error: 'Participant not found',
          message: 'Participant non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Participant retiré avec succès'
      });

    } catch (error) {
      console.error('Remove participant error:', error);
      next(error);
    }
  }

  async getParticipants(req, res, next) {
    try {
      const { id } = req.params;

      // Vérifier que l'événement appartient à l'utilisateur
      const event = await Event.findById(id);
      if (!event || event.user_id !== req.userId) {
        return res.status(404).json({
          error: 'Event not found',
          message: 'Événement non trouvé ou accès refusé'
        });
      }

      const participants = await Event.getParticipants(id);

      res.json({
        success: true,
        participants
      });

    } catch (error) {
      console.error('Get participants error:', error);
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

      const events = await Event.search(req.userId, searchTerm);

      res.json({
        success: true,
        events,
        searchTerm
      });

    } catch (error) {
      console.error('Search events error:', error);
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      
      const events = await Event.getUpcoming(req.userId, parseInt(limit));

      res.json({
        success: true,
        events
      });

    } catch (error) {
      console.error('Get upcoming events error:', error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await Event.getStats(req.userId);

      res.json({
        success: true,
        stats: {
          ...stats,
          total_participants: parseInt(stats.total_participants) || 0
        }
      });

    } catch (error) {
      console.error('Get event stats error:', error);
      next(error);
    }
  }
}

module.exports = new EventController();