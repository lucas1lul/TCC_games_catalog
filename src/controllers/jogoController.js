const bcrypt = require('bcrypt');
const db = require('../config/db');

// --- IMPORTAÇÃO DOS MODELS ---
const { readUsers, saveUsers } = require('../models/usersModel'); // Novo model de persistência
//const { readGames, saveGames } = require('../../models/gamesModel'); // Model de persistência existente

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
            perfil: usuario.perfil,
            favoritos: usuario.favoritos || []
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

// --- FUNÇÃO: Favoritar/Desfavoritar Jogo (toggleFavorito) ---
exports.toggleFavorito = async (req, res) => {
    try {
        const { usuarioId, jogoId } = req.body;
        let usuarios = readUsers(); // Usa seu model de persistência

        // 1. Encontra o usuário pelo ID
        const index = usuarios.findIndex(u => u.id == usuarioId);
        if (index === -1) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // 2. Inicializa o array de favoritos se não existir
        if (!usuarios[index].favoritos) {
            usuarios[index].favoritos = [];
        }

        // 3. Lógica de Toggle (Adiciona se não tem, remove se tem)
        const favIndex = usuarios[index].favoritos.indexOf(jogoId);
        
        if (favIndex === -1) {
            usuarios[index].favoritos.push(jogoId);
        } else {
            usuarios[index].favoritos.splice(favIndex, 1);
        }

        // 4. Salva as alterações usando seu model
        saveUsers(usuarios);

        res.status(200).json({ 
            mensagem: "Favoritos atualizados!", 
            favoritos: usuarios[index].favoritos 
        });
    } catch (error) {
        console.error("Erro em toggleFavorito:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar favoritos" });
    }
};

// --- FUNÇÃO: Buscar Favoritos do Usuário ---
exports.getUserFavorites = (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        const usuarios = readUsers();
        
        const usuario = usuarios.find(u => u.id == id);
        
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Retorna apenas a lista de IDs de favoritos
        res.status(200).json(usuario.favoritos || []);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar favoritos" });
    }
};

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

exports.getGames = async (req, res) => {
    try {
        const { curso, componente, habilidade, plataforma, idioma } = req.query;
        
        console.log("REQ.QUERY:", req.query);
        // DISTINCT evita jogos duplicados se eles tiverem mais de um curso/habilidade
        let query = "SELECT DISTINCT J.* FROM JOGOS J";
        const params = [];

        // Adicionando as junções (JOINs) dinamicamente conforme os filtros enviados
        if (curso) query += " JOIN JOGOS_CURSO JC ON J.IDJOGO = JC.IDJOGO JOIN CURSO C ON JC.IDCURSO = C.IDCURSO";
        if (componente) query += " JOIN JOGOS_COMPONENTES JCOMP ON J.IDJOGO = JCOMP.IDJOGO JOIN COMPONENTES COMP ON JCOMP.IDCOMPONENTE = COMP.IDCOMPONENTE";
        if (habilidade) query += " JOIN JOGOS_HABILIDADES JH ON J.IDJOGO = JH.IDJOGO JOIN HABILIDADES H ON JH.habilidadeID = H.habilidadeID";
        if (plataforma) query += " JOIN JOGOS_PLATAFORMA JP ON J.IDJOGO = JP.IDJOGO JOIN PLATAFORMA P ON JP.IDPLATAFORMA = P.IDPLATAFORMA";
        
        query += " WHERE 1=1";

        if (curso) {
            query += " AND C.DESCRICAO LIKE ?";
            params.push(`%${curso}%`);
        }
        if (componente) {
            // No banco da Carol, COMPONENTES tem a coluna 'DISCIPLINA'
            query += " AND COMP.DISCIPLINA LIKE ?";
            params.push(`%${componente}%`);
        }
        if (habilidade) {
            query += " AND H.descricaoHabilidade LIKE ?";
            params.push(`%${habilidade}%`);
        }
        if (plataforma) {
            query += " AND P.DESCRICAO LIKE ?";
            params.push(`%${plataforma}%`);
        }
        if (idioma) {
            query += " AND J.IDIOMA LIKE ?";
            params.push(`%${idioma}%`);
        }

        console.log("SQL FINAL:", query);
        console.log("PARAMS:", params);

        const [rows] = await db.promise().query(query, params);
        console.log("RESULTADOS:", rows.length);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro no SQL:", error);
        res.status(500).json({ mensagem: "Erro ao buscar jogos no banco" });
    }
};

exports.getGameById = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM JOGOS WHERE IDJOGO = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ mensagem: "Jogo não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao obter jogo" });
    }
};

exports.addGame = async (req, res) => {
    try {
        const { NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA } = req.body;
        
        const sql = `INSERT INTO JOGOS (NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.promise().query(sql, [NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA]);

        res.status(201).json({ mensagem: "Jogo cadastrado no SQL!", id: result.insertId });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao salvar no banco SQL" });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        await db.promise().query("DELETE FROM JOGOS WHERE IDJOGO = ?", [req.params.id]);
        res.status(200).json({ mensagem: "Jogo deletado do SQL!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao deletar jogo" });
    }
};