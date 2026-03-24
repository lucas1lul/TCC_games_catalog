const gameRepository = require('../repositories/gameRepository');

// --- FUNÇÕES AUXILIARES DE MAPEAMENTO E VALIDAÇÃO ---

/**
 * Valida e formata os dados para o cadastro OFICIAL de um jogo.
 */
const mapAndValidateGame = (data) => {
    // Validações obrigatórias
    if (!data.NOME || data.NOME.trim() === "") throw new Error("O Nome do jogo é obrigatório.");
    if (!data.LINK || data.LINK.trim() === "") throw new Error("O Link do jogo é obrigatório.");

    // Função auxiliar para garantir que os IDs venham como array
    const toArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    return {
        NOME: data.NOME,
        LINKIMAGEM: data.LINKIMAGEM || null,
        LINK: data.LINK,
        IDIOMA: data.IDIOMA || 'Português',
        LICENSA: data.LICENSA || 'Gratis',
        INTERACAO: data.INTERACAO || 'Single Player',
        
        // Garante que sejam arrays (ex: [1, 3, 5])
        HABILIDADES: toArray(data.HABILIDADES),
        GENERO: toArray(data.GENERO),
        PLATAFORMA: toArray(data.PLATAFORMA),
        COMPONENTE: toArray(data.COMPONENTE)
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
exports.createGame = async (gameData) => {
    const validatedData = mapAndValidateGame(gameData);
    const newId = await gameRepository.createGame(validatedData);
    return { id: newId, message: "Jogo criado com sucesso!" };
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

// --- BUSCA DE HABILIDADES ---

exports.searchHabilidades = async (termo) => {
    if (!termo) return [];
    // O Service apenas repassa a ordem para o Repository, que cuida do banco
    return await gameRepository.searchHabilidades(termo);
};