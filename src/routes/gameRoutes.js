const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require("../middlewares/authMiddleware");

console.log("gameController.updateGame:", typeof gameController.updateGame);
console.log("gameController.deleteGame:", typeof gameController.deleteGame);
// ROTAS DE GAMES
router.get('/games', gameController.getGames);
router.get('/games/:id', gameController.getGameById);
router.post(
  "/games",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("Administrador"),
  gameController.create
);
router.put(
  '/games/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("Administrador"),
  gameController.updateGame
);
router.delete(
  '/games/:id',
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("Administrador"),
  gameController.deleteGame
);

module.exports = router;