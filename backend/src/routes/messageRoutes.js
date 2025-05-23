const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes principales
router.post('/', asyncHandler(MessageController.create));
router.get('/', asyncHandler(MessageController.getAll));
router.get('/search', asyncHandler(MessageController.search));
router.get('/stats', asyncHandler(MessageController.getStats));
router.get('/:id', asyncHandler(MessageController.getById));
router.put('/:id', asyncHandler(MessageController.update));
router.delete('/:id', asyncHandler(MessageController.delete));

// Routes d'envoi
router.post('/:id/send', asyncHandler(MessageController.send));
router.post('/:id/schedule', asyncHandler(MessageController.schedule));
router.get('/:id/sends', asyncHandler(MessageController.getSends));

// Messages par événement
router.get('/event/:eventId', asyncHandler(MessageController.getByEvent));

module.exports = router;