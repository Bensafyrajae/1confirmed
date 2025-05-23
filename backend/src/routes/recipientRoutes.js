const express = require('express');
const router = express.Router();
const RecipientController = require('../controllers/recipientController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes principales
router.post('/', asyncHandler(RecipientController.create));
router.post('/bulk', asyncHandler(RecipientController.bulkCreate));
router.get('/', asyncHandler(RecipientController.getAll));
router.get('/search', asyncHandler(RecipientController.search));
router.get('/tags', asyncHandler(RecipientController.getAllTags));
router.get('/by-tags', asyncHandler(RecipientController.getByTags));
router.get('/stats', asyncHandler(RecipientController.getStats));
router.get('/recent', asyncHandler(RecipientController.getRecentlyAdded));
router.get('/:id', asyncHandler(RecipientController.getById));
router.put('/:id', asyncHandler(RecipientController.update));
router.delete('/:id', asyncHandler(RecipientController.delete));

// Routes spéciales
router.put('/:id/opt-out', asyncHandler(RecipientController.optOut));
router.put('/:id/opt-in', asyncHandler(RecipientController.optIn));

module.exports = router;