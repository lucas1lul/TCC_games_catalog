const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await userService.login(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMe = (req, res) => {
  try {
    const usuarioId = req.user?.id || req.query.id; // temporário até implementar auth JWT
    const user = userService.getMe(usuarioId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.updateMe = (req, res) => {
  try {
    const usuarioId = req.user?.id || req.query.id;
    const updatedUser = userService.updateMe(usuarioId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listUsers = (req, res) => {
  try {
    const users = userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.toggleFavorito = (req, res) => {
  try {
    const { usuarioId, jogoId } = req.body;

    const favoritos = userService.toggleFavorito(usuarioId, jogoId);

    res.status(200).json({ favoritos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const { id } = req.params;

    const games = await userService.getUserFavorites(id);

    res.status(200).json(games);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};