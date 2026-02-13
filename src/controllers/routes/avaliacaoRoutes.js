// src/controllers/routes/avaliacaoRoutes.js
const express = require("express");
const router = express.Router();
const avaliacaoController = require("../avaliacaoController");

router.get("/games/:id/avaliacoes", avaliacaoController.getAvaliacoesByGame);
router.post("/avaliacoes", avaliacaoController.postAvaliacao);

module.exports = router;
