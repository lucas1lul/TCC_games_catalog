const { readGames, saveGames } = require('../models/gamesModel');

// Função auxiliar
const mapAndValidateGame = (gameData) => {
    return {
        titulo: gameData.titulo,
        descricao: gameData.descricao,
        genero: gameData.genero
    };
};

// GET /games
exports.getAllGames = (req, res) => {
    const games = readGames();
    res.json(games);
};

// GET /games/:id
exports.getGameById = (req, res) => {
    const games = readGames();
    const game = games.find(g => g.id === Number(req.params.id));

    if (!game) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado' });
    }

    res.json(game);
};

// POST /games
exports.addGame = (req, res) => {
    const games = readGames();
    const novoGame = mapAndValidateGame(req.body);

    novoGame.id = games.length > 0
        ? Math.max(...games.map(g => g.id)) + 1
        : 1;

    games.push(novoGame);
    saveGames(games);

    res.status(201).json(novoGame);
};

// PUT /games/:id
exports.updateGame = (req, res) => {
    const games = readGames();
    const index = games.findIndex(g => g.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado' });
    }

    games[index] = { ...games[index], ...req.body };
    saveGames(games);

    res.json(games[index]);
};

// DELETE /games/:id
exports.deleteGame = (req, res) => {
    const games = readGames();
    const novosGames = games.filter(g => g.id !== Number(req.params.id));

    saveGames(novosGames);
    res.status(204).send();
};
