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
        // Mapeia os dados recebidos do frontend (req.body) para o padrão do Service
        const gameData = {
            NOME: req.body.NOME || req.body.nome || req.body.titulo,
            LINKIMAGEM: req.body.LINKIMAGEM || req.body.linkImagem,
            LINK: req.body.LINK || req.body.link,
            IDIOMA: req.body.IDIOMA || req.body.idioma,
            LICENSA: req.body.LICENCA || req.body.licenca || req.body.licensa,
            INTERACAO: req.body.INTERACAO || req.body.interacao,
            // Tratamos as relações como arrays (caso o admin selecione mais de um)
            HABILIDADES: req.body.HABILIDADES || req.body.habilidades,
            GENERO: req.body.GENERO || req.body.genero,
            PLATAFORMA: req.body.PLATAFORMA || req.body.plataforma,
            COMPONENTE: req.body.COMPONENTE || req.body.componente
        };

        const result = await gameService.createGame(gameData);
        res.status(201).json(result);

    } catch (error) {
        console.error("Erro na Controller [createGame]:", error.message);
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

exports.searchHabilidades = async (req, res) => {
    try {
        const termo = req.query.q;
        if (!termo || termo.length < 2) {
            return res.json([]);
        }

        // Chama o service para buscar no banco
        const habilidades = await gameService.searchHabilidades(termo);
        
        // Retorna o JSON (isso resolve o erro de Unexpected token '<')
        res.json(habilidades);
    } catch (error) {
        console.error("Erro no Controller [searchHabilidades]:", error);
        res.status(500).json({ error: "Erro interno ao buscar habilidades." });
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
        // Como estamos lidando com express-session, o ID geralmente fica aqui:
        const usuarioId = req.session?.user?.id || req.user?.id;

        if (!usuarioId) {
            return res.status(401).json({ error: "Usuário não autenticado ou sessão expirada." });
        }

        // Pede para o Service buscar os dados
        const envios = await gameService.obterMeusEnvios(usuarioId);
        
        // Devolve os dados para o frontend (o seu user.js vai pegar isso e montar a tabela)
        res.json(envios);

    } catch (error) {
        console.error("Erro no Controller [listarMeusEnvios]:", error);
        res.status(500).json({ error: "Erro interno ao buscar as sugestões." });
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