const express = require('express');
const router = express.Router();

const gameController = require('../gameController');
const authMiddleware = require('../../middlewares/auth');

// Rotas Públicas
router.get('/', gameController.getAllGames);
router.get('/:id', gameController.getGameById);

// Rotas Protegidas
router.post('/', authMiddleware, gameController.addGame);
router.put('/:id', authMiddleware, gameController.updateGame);
router.delete('/:id', authMiddleware, gameController.deleteGame);

module.exports = router;

