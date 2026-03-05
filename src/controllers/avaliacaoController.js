const avaliacaoService = require("../services/avaliacaoService");

// GET /api/games/:id/avaliacoes
exports.getAvaliacoesByGame = (req, res) => {
  try {
    const { id } = req.params;
    const result = avaliacaoService.getAvaliacoesByGame(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/avaliacoes
exports.create = (req, res) => {
  try {
    const result = avaliacaoService.createAvaliacao(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};