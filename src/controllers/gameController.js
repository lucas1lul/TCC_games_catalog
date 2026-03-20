const gameService = require('../services/gameService');

// --- CONSULTAS PÚBLICAS ---

exports.getGames = async (req, res) => {
    try {
        const games = await gameService.getGames(req.query);
        res.status(200).json(games);
    } catch (error) {
        console.error("Erro ao buscar jogos:", error);
        res.status(500).json({ mensagem: "Erro ao buscar jogos." });
    }
};

exports.getGameById = async (req, res) => {
    try {
        const game = await gameService.getGameById(req.params.id);
        if (!game) {
            return res.status(404).json({ mensagem: "Jogo não encontrado." });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao obter jogo." });
    }
};

// --- AÇÕES DO ADMINISTRADOR (CATÁLOGO OFICIAL) ---

exports.createGame = async (req, res) => {
    try {
        // O mapeamento técnico agora é feito dentro do Service
        const insertId = await gameService.createGame(req.body);
        res.status(201).json({ message: "Jogo cadastrado com sucesso!", id: insertId });
    } catch (error) {
        console.error("Erro ao criar jogo:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.updateGame = async (req, res) => {
    try {
        const response = await gameService.updateGame(req.params.id, req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        await gameService.deleteGame(req.params.id);
        res.status(200).json({ mensagem: "Jogo deletado!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar jogo." });
    }
};

// --- AÇÕES DO PROFISSIONAL TI (SUGESTÕES) ---

exports.sugerirJogo = async (req, res) => {
    try {
        // Pegamos o ID do usuário da sessão (com fallback para testes)
        const usuarioId = req.session.user?.id || 1; 
        
        const insertId = await gameService.sugerirJogo(req.body, usuarioId);
        res.status(201).json({ message: "Sugestão salva com sucesso!", id: insertId });
    } catch (error) {
        console.error("Erro ao processar sugestão:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.listarMeusEnvios = async (req, res) => {
    try {
        const usuarioId = req.session.user?.id || 1;
        const envios = await gameService.listarMeusEnvios(usuarioId);
        res.status(200).json(envios);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar seus envios." });
    }
};

// --- CURADORIA (ADMINISTRADOR ANALISANDO SUGESTÕES) ---

exports.listPending = async (req, res) => {
    try {
        const pendingGames = await gameService.listarPendentes();
        res.json(pendingGames);
    } catch (error) {
        console.error("Erro ao listar pendentes:", error);
        res.status(500).json({ error: "Erro ao buscar jogos pendentes." });
    }
};

exports.updateGameStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'aprovado' ou 'rejeitado'
        
        const response = await gameService.atualizarStatusSugestao(id, status);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar o status da sugestão." });
    }
};