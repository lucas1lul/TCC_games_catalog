const gameRepository = require('../repositories/gameRepository');

// --- FUNÇÕES AUXILIARES DE MAPEAMENTO E VALIDAÇÃO ---

/**
 * Valida e formata os dados para o cadastro OFICIAL de um jogo.
 */
const mapAndValidateGame = (gameData) => {
    if (!gameData.titulo || !gameData.componente) {
        throw new Error("Título e Componente são obrigatórios.");
    }

    return {
        titulo: gameData.titulo,
        buscador: gameData.buscador || "N/A",
        autor: gameData.autor || "N/A",
        generos: Array.isArray(gameData.generos) ? gameData.generos : [],
        habilidades: Array.isArray(gameData.habilidades) ? gameData.habilidades : [],
        modelo_custo: gameData.modelo_custo || "N/A",
        ano_lancamento: gameData.ano_lancamento ? parseInt(gameData.ano_lancamento, 10) : null,
        descricao: gameData.descricao || "Sem descrição.",
        url: gameData.url || "N/A",
        plataforma: Array.isArray(gameData.plataforma) ? gameData.plataforma : [],
        idioma: gameData.idioma || "N/A",
        pais_origem: gameData.pais_origem || "N/A",
        componente: gameData.componente,
    };
};

/**
 * Valida e formata os dados para a SUGESTÃO de um jogo por Profissional de TI.
 */
const mapAndValidateSuggestion = (data, usuarioId) => {
    if (!data.nome || !data.link) {
        throw new Error("Nome e Link são obrigatórios para sugerir um jogo.");
    }

    return {
        NOME: data.nome,
        LINK: data.link,
        JUSTIFICATIVA: data.justificativa || "Sem justificativa",
        STATUS: 'pendente',
        ID_SUGERIDO_POR: usuarioId
    };
};

// --- MÉTODOS EXPORTADOS ---

// Consultas
exports.getGames = async (filters) => {
    return await gameRepository.findAll(filters);
};

exports.getGameById = async (id) => {
    return await gameRepository.findById(id);
};

// Fluxo de Cadastro Oficial (Admin)
exports.createGame = async (data) => {
    const validatedData = mapAndValidateGame(data);
    return await gameRepository.createGame(validatedData);
};

exports.updateGame = async (id, data) => {
    const result = await gameRepository.updateGame(id, data);
    if (result.affectedRows === 0) {
        throw new Error("Jogo não encontrado.");
    }
    return { message: "Jogo atualizado com sucesso." };
};

exports.deleteGame = async (id) => {
    return await gameRepository.remove(id);
};

// Fluxo de Sugestão (Profissional TI)
exports.sugerirJogo = async (data, usuarioId) => {
    const novaSugestao = mapAndValidateSuggestion(data, usuarioId);
    return await gameRepository.createSuggestion(novaSugestao);
};

// Fluxo de Análise (Admin)
exports.listarPendentes = async () => {
    return await gameRepository.findPending();
};

exports.atualizarStatusSugestao = async (id, status) => {
    const result = await gameRepository.updateStatus(id, status);
    if (result.affectedRows === 0) {
        throw new Error("Sugestão não encontrada.");
    }
    return { message: `Sugestão ${status} com sucesso.` };
};

exports.obterMeusEnvios = async (usuarioId) => {
    if (!usuarioId) {
        throw new Error("ID do usuário não fornecido para a busca.");
    }
    
    const envios = await gameRepository.buscarEnviosPorUsuario(usuarioId);
    return envios;
};

