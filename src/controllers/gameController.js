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

// Não esqueça de importar o repositório no topo do arquivo!
const gameRepository = require('../repositories/gameRepository');

exports.createGame = async (req, res) => {
  console.log("Dados recebidos no Body:", req.body);
    // Validação da pré-condição: Perfil Administrativo
    if (!req.session.user || req.session.user.perfil !== 'administrador') {
        return res.status(403).json({ error: "Acesso negado: apenas administradores podem cadastrar jogos." });
    }

    // Adicionei 'licensa' e 'linkimagem' aqui, pois o banco de dados exige isso
    const { nome, link, interacao, idioma, licensa, linkimagem, habilidades, generos, plataformas } = req.body;

    // Fluxo Alternativo 3a: Validação de dados obrigatórios
    if (!nome || !link || !interacao || !idioma) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    try {
        // A MÁGICA ACONTECE AQUI: Chamamos o repositório e mapeamos os dados
        const insertId = await gameRepository.createGame({
            NOME: nome,
            LINK: link,
            LINKIMAGEM: linkimagem || 'placeholder.png', // Fallback caso venha vazio
            IDIOMA: idioma,
            INTERACAO: interacao,
            LICENSA: licensa || 'Não informada'
        });

        // Obs: As 'habilidades', 'generos' e 'plataformas' que vêm no req.body 
        // precisarão ser inseridas em tabelas associativas (N:N) em um segundo momento,
        // usando o 'insertId' gerado acima. Mas por enquanto, vamos focar em salvar o jogo principal!

        res.status(201).json({ message: "Jogo cadastrado com sucesso!", id: insertId });
    } catch (error) {
        console.error("Erro detalhado no controller:", error);
        res.status(500).json({ error: "Erro ao salvar no banco de dados." });
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

exports.getPendingGames = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM jogos WHERE STATUS = 'pendente'"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar submissões pendentes." });
    }
};

exports.listPending = async (req, res) => {
    try {
        const pendingGames = await gameRepository.findPending();
        res.json(pendingGames);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar jogos pendentes." });
    }
};

exports.updateGameStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await gameRepository.updateStatus(id, status);
        res.json({ message: `O jogo agora está ${status}!` });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar o status do jogo." });
    }
};