const express = require("express");
const router = express.Router();
const avaliacaoController = require("../controllers/avaliacaoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get(
  "/games/:id/avaliacoes",
  avaliacaoController.getAvaliacoesByGame
);

router.get(
  "/usuarios/:id/avaliados",
  authMiddleware.isAuthenticated,
  avaliacaoController.getAvaliacoesByUser
);

router.post(
  "/avaliacoes",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRoles("professor"),
  avaliacaoController.createAvaliacao
);

module.exports = router;