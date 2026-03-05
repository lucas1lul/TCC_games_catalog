const gameService = require('../services/gameService');

exports.getGames = async (req, res) => {
  try {
    const games = await gameService.getGames(req.query);
    res.status(200).json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar jogos" });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await gameService.getGameById(req.params.id);

    if (!game) {
      return res.status(404).json({ mensagem: "Jogo não encontrado" });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao obter jogo" });
  }
};

exports.create = async (req, res) => {
  try {
    const id = await gameService.create(req.body);
    res.status(201).json({ mensagem: "Jogo cadastrado!", id });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao salvar jogo" });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    await gameService.deleteGame(req.params.id);
    res.status(200).json({ mensagem: "Jogo deletado!" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao deletar jogo" });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const response = await gameService.updateGame(id, data);

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};