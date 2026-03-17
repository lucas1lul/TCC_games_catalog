const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require("../middlewares/authMiddleware");

// ROTAS PÚBLICAS
router.get('/games', gameController.getGames);
router.get('/games/:id', gameController.getGameById);

// ROTAS ADMIN
router.post(
  "/games",
  authMiddleware.authorizeRoles("administrador"),
  gameController.createGame
);

router.put(
  "/games/:id",
  authMiddleware.authorizeRoles("administrador"),
  gameController.updateGame
);

router.delete(
  "/games/:id",
  authMiddleware.authorizeRoles("administrador"),
  gameController.deleteGame
);

router.get('/games/pending', authMiddleware.authorizeRoles("administrador"), gameController.listPending);
router.put('/games/:id/status', authMiddleware.authorizeRoles("administrador"), gameController.updateGameStatus);

module.exports = router;