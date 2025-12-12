const bcrypt = require('bcrypt');

// --- IMPORTAÇÃO DOS MODELS ---
const { readUsers, saveUsers } = require('../models/usersModel'); // Novo model de persistência
const { readGames, saveGames } = require('../models/gamesModel'); // Model de persistência existente

// --- FUNÇÃO DE REGISTRO (register) ---
exports.register = async (req, res) => {
    const { nome, email, senha, perfil } = req.body;
    let usuarios = readUsers(); // Usa a função do Model

    const perfisValidos = ["aluno", "professor", "administrador", "profissional_ti"];
    if (!perfil || !perfisValidos.includes(perfil)) {
        return res.status(400).json({ mensagem: 'Perfil inválido ou ausente.' });
    }

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        return res.status(409).json({ mensagem: 'Email já registrado!' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const proximoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

    const novoUsuario = {
        id: proximoId,
        nome,
        email,
        senha: hash,
        perfil: perfil 
    };

    usuarios.push(novoUsuario);
    saveUsers(usuarios); // Usa a função do Model para salvar

    res.status(201).json({ 
        mensagem: 'Usuário registrado!', 
        usuario: { 
            id: novoUsuario.id, 
            nome: novoUsuario.nome, 
            email: novoUsuario.email,
            perfil: novoUsuario.perfil
        } 
    });
};

// --- FUNÇÃO DE LOGIN (login) ---
exports.login = async (req, res) => {
    const { email, senha } = req.body;
    const usuarios = readUsers(); // Usa a função do Model

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
    }

    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
    }

    // Login bem-sucedido
    res.status(200).json({ 
        mensagem: 'Login bem-sucedido!', 
        usuario: { 
            id: usuario.id, 
            nome: usuario.nome, 
            email: usuario.email,
            perfil: usuario.perfil 
        } 
    });
};

// --- FUNÇÃO: Listar todos os usuários (Endpoint de teste) ---
exports.listUsers = (req, res) => {
    const usuarios = readUsers(); // Usa a função do Model
    
    // Retorna os usuários sem o hash da senha por segurança!
    const usersWithoutPassword = usuarios.map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil
    }));
    res.status(200).json(usersWithoutPassword);
};


// -------------------------------------------------------------------
// RESTANTE DO CÓDIGO (Game Functions) - MANTIDO
// -------------------------------------------------------------------

// --- CONTATAR DESENVOLVEDOR ---
exports.contactDeveloper = (req, res) => {
    console.log("Mensagem enviada ao dev:", req.body);
    res.json({ mensagem: "Mensagem enviada ao desenvolvedor!" });
};

// --- Função Auxiliar para Mapeamento e Validação de um ÚNICO JOGO (MANTIDO) ---
const mapAndValidateGame = (gameData) => {
    // 1. Validação mínima para garantir que campos essenciais existem
    if (!gameData.titulo || !gameData.componente) {
        // Lançamos um erro customizado para sabermos qual jogo falhou
        throw new Error(`Validação falhou: Título ou Componente são obrigatórios para um dos jogos.`);
    }

    // 2. Mapeamento dos campos de entrada
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

// --- FUNÇÃO GET GAMES (MANTIDO) ---
exports.getGames = (req, res) => {
    try {
        const games = readGames();  // Lendo do gamesModel
        // Campos de filtro ajustados para a nova estrutura:
        const { componente, habilidade, plataforma, genero, ano_lancamento, idioma } = req.query;

        let resultados = games;

        // Filtro por COMPONENTE (Area de conhecimento)
        if (componente) {
            resultados = resultados.filter(j => 
                j.componente && j.componente.toLowerCase().includes(componente.toLowerCase())
            );
        }

        // Filtro por HABILIDADE (busca em array)
        if (habilidade) {
            // Garante que j.habilidades é um array antes de usar some()
            const hab = habilidade.toLowerCase();
            resultados = resultados.filter(j => 
                Array.isArray(j.habilidades) && j.habilidades.some(h => h.toLowerCase().includes(hab))
            );
        }
        
        // Filtro por GÊNERO (busca em array)
        if (genero) {
            const gen = genero.toLowerCase();
            resultados = resultados.filter(j => 
                Array.isArray(j.generos) && j.generos.some(g => g.toLowerCase().includes(gen))
            );
        }

        // Filtro por PLATAFORMA (busca em array)
        if (plataforma) {
            const plat = plataforma.toLowerCase();
            resultados = resultados.filter(j => 
                Array.isArray(j.plataforma) && j.plataforma.some(p => p.toLowerCase().includes(plat))
            );
        }
        
        // Filtro por ANO_LANCAMENTO (comparação exata ou parcial, dependendo da necessidade)
        if (ano_lancamento) {
            // Se for string, tenta converter para número para comparação exata (recomendado)
            const ano = parseInt(ano_lancamento, 10);
            if (!isNaN(ano)) {
                resultados = resultados.filter(j => j.ano_lancamento === ano);
            }
        }
        
        // Filtro por IDIOMA
        if (idioma) {
            resultados = resultados.filter(j => 
                j.idioma && j.idioma.toLowerCase().includes(idioma.toLowerCase())
            );
        }

        res.status(200).json(resultados);

    } catch (error) {
        console.error("Erro em getGames:", error);
        res.status(500).json({ mensagem: "Erro ao listar jogos" });
    }
};

// --- DETALHES DO JOGO (MANTIDO) ---
exports.getGameById = (req, res) => {
    try {
        const games = readGames();
        // Note: req.params.id é string. As IDs no JSON são números. Use == para comparação flexível.
        const game = games.find(g => g.id == req.params.id);

        if (!game) return res.status(404).json({ mensagem: "Jogo não encontrado" });

        res.json(game);
    } catch (error) {
        console.error("Erro em getGameById:", error);
        res.status(500).json({ mensagem: "Erro ao obter jogo" });
    }
};

// --- CADASTRAR JOGO (MANTIDO) ---
exports.addGame = (req, res) => {
    try {
        const games = readGames(); 
        let novosJogosParaAdicionar = [];
        let jogosProcessados = [];
        
        // ... (Verifica se é array ou objeto único) ...

        if (Array.isArray(req.body)) {
            novosJogosParaAdicionar = req.body;
        } else if (typeof req.body === 'object' && req.body !== null) {
            novosJogosParaAdicionar = [req.body];
        } else {
            return res.status(400).json({ mensagem: "O corpo da requisição deve ser um objeto JSON ou um array de objetos JSON." });
        }

        // --- CÁLCULO DE ID SEQUENCIAL GARANTINDO INTEIRO ---
        // 1. Encontra o ID máximo
        const idsExistentes = games.map(g => g.id || 0);
        let maxId = idsExistentes.length > 0 ? Math.max(...idsExistentes) : 0;
        
        // 2. Garante que o ID inicial é um inteiro, arredondando qualquer float grande.
        // Se games.json estiver limpo, maxId será 0.
        let proximoId = Math.floor(maxId); 
        
        // ----------------------------------------------------
        
        // 3. Processa cada item (mapeamento e validação)
        for (const jogoData of novosJogosParaAdicionar) {
            const novoJogo = mapAndValidateGame(jogoData);
            
            // ATRIBUIÇÃO DO NOVO ID SEQUENCIAL:
            proximoId++;
            novoJogo.id = proximoId; // ATRIBUI O INTEIRO CORRETO

            jogosProcessados.push(novoJogo);
        }

        // 4. Adiciona e salva
        games.push(...jogosProcessados);
        saveGames(games);

        // ... (Retorno de sucesso)
        const totalAdicionados = jogosProcessados.length;
        if (totalAdicionados === 1) {
            res.status(201).json({ mensagem: "Jogo cadastrado com sucesso", jogo: jogosProcessados[0] });
        } else {
            res.status(201).json({ mensagem: `${totalAdicionados} jogos cadastrados com sucesso`, jogos_adicionados: jogosProcessados });
        }

    } catch (error) {
        console.error("Erro ao cadastrar jogo(s):", error.message);
        // Retorna 400 se a validação customizada falhar
        if (error.message.startsWith("Validação falhou")) {
            return res.status(400).json({ mensagem: error.message });
        }
        res.status(500).json({ mensagem: "Erro interno ao cadastrar jogo(s)" });
    }
};

// --- DELETAR JOGO (MANTIDO) ---
exports.deleteGame = (req, res) => {
    try {
        let games = readGames();
        const id = req.params.id;

        const existe = games.find(g => g.id == id);
        if (!existe) {
            return res.status(404).json({ mensagem: "Jogo não encontrado" });
        }

        games = games.filter(g => g.id != id);

        saveGames(games);

        res.status(200).json({ mensagem: "Jogo deletado com sucesso!" });
    } catch (error) {
        console.error("Erro em deleteGame:", error);
        res.status(500).json({ mensagem: "Erro ao deletar jogo" });
    }
};