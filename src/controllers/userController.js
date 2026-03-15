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
    const { email, senha } = req.body;

    const user = await userService.login({ email, senha });

    req.session.user = {
      id: user.id,
      nome: user.nome,
      perfil: user.perfil,
      favoritos: user.favoritos || []
    };

    req.session.save((err) => {
      if (err) {
        console.error("Erro ao salvar sessão:", err);
        return res.status(500).json({ error: "Erro ao salvar sessão" });
      }

      res.json({ user: req.session.user });
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// src/controllers/userController.js
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao destruir sessão" });
    }
    res.clearCookie("connect.sid", { path: '/' });
    return res.status(200).json({ message: "Logout realizado com sucesso" });
  });
};

exports.getMe = (req, res) => {
  try {

    if (!req.session.user) {
      return res.status(200).json({ user: null });
    }

    res.status(200).json({
      user: req.session.user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    // Nunca confie em IDs vindos do query/body para rotas "Me"
    const usuarioId = req.session.user?.id;
    
    if (!usuarioId) return res.status(401).json({ error: "Não autorizado" });

    const updatedUser = await userService.updateMe(usuarioId, req.body);
    
    // Atualiza o nome ou perfil na sessão caso tenham mudado
    req.session.user = { ...req.session.user, ...updatedUser };
    
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

exports.toggleFavorito = async (req, res) => { // Adicionei async caso o service seja assíncrono
  try {
    // O jogoId vem do body (enviado pelo fetch), 
    // mas o usuarioId vem da SESSÃO (segurança)
    const { jogoId } = req.body;
    const usuarioId = req.session.user?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: "Sessão inválida ou expirada" });
    }

    // Chama o service passando o ID que veio da sessão
    const favoritos = await userService.toggleFavorito(usuarioId, jogoId);

    // Importante: Atualize os favoritos na sessão também! 
    // Assim, ao dar F5, a navbar e o catálogo já sabem os novos favoritos.
    req.session.user.favoritos = favoritos;

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