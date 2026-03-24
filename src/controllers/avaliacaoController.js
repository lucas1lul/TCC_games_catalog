const avaliacaoService = require("../services/avaliacaoService");

// GET /api/games/:id/avaliacoes
exports.getAvaliacoesByGame = (req, res) => {
  try {
    const { id } = req.params;
    const result = avaliacaoService.getAvaliacoesByGame(Number(id));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/avaliacoes
exports.createAvaliacao = (req, res) => {
  try {
    const usuarioId = req.session.user?.id;
    const usuarioNome = req.session.user?.nome; // <<< ADICIONE ESTA LINHA
    const perfil = req.session.user?.perfil;

    if (!usuarioId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (perfil !== 'professor') {
      return res.status(403).json({ error: "Apenas professores podem realizar avaliações pedagógicas." });
    }

    const { jogoId, nota, comentario } = req.body;

    // Agora passamos o usuarioNome que o Service exige
    const novaAvaliacao = avaliacaoService.createAvaliacao({
      usuarioId,
      usuarioNome, // <<< PASSE A VARIÁVEL AQUI
      jogoId: Number(jogoId),
      nota: Number(nota),
      comentario
    });

    res.status(201).json(novaAvaliacao);
  } catch (error) {
    console.error("ERRO NO POST /api/avaliacoes:", error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getAvaliacoesByUser = async (req, res) => { // Adicione async aqui
    try {
        const { id } = req.params;
        
        if (Number(id) !== Number(req.session.user?.id)) {
            return res.status(403).json({ error: "Acesso negado." });
        }

        // AGUARDA o service processar as promessas do banco
        const result = await avaliacaoService.getJogosAvaliadosPorUsuario(id);
        res.json(result);
    } catch (error) {
        console.error("Erro no Controller [getAvaliacoesByUser]:", error);
        res.status(500).json({ error: error.message });
    }
};