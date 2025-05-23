const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes principales
router.post('/', asyncHandler(EventController.create));
router.get('/', asyncHandler(EventController.getAll));
router.get('/upcoming', asyncHandler(EventController.getUpcoming));
router.get('/stats', asyncHandler(EventController.getStats));
router.get('/search', asyncHandler(EventController.search));
router.get('/:id', asyncHandler(EventController.getById));
router.put('/:id', asyncHandler(EventController.update));
router.delete('/:id', asyncHandler(EventController.delete));

// Routes pour les participants
router.get('/:id/participants', asyncHandler(EventController.getParticipants));
router.post('/:id/participants', asyncHandler(EventController.addParticipant));
router.delete('/:id/participants/:recipientId', asyncHandler(EventController.removeParticipant));

module.exports = router;