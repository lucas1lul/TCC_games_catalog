const gameRepository = require('../repositories/gameRepository');

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
        ano_lancamento: gameData.ano_lancamento
            ? parseInt(gameData.ano_lancamento, 10)
            : null,
        descricao: gameData.descricao || "Sem descrição.",
        url: gameData.url || "N/A",
        plataforma: Array.isArray(gameData.plataforma) ? gameData.plataforma : [],
        idioma: gameData.idioma || "N/A",
        pais_origem: gameData.pais_origem || "N/A",
        componente: gameData.componente,
    };
};

exports.getGames = async (filters) => {
    return await gameRepository.findAll(filters);
};

exports.getGameById = async (id) => {
    return await gameRepository.findById(id);
};

exports.addGame = async (data) => {
    const validatedData = mapAndValidateGame(data);
    return await gameRepository.create(validatedData);
};

exports.deleteGame = async (id) => {
    return await gameRepository.remove(id);
};