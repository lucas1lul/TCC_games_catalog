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
        const { id } = req.params;
        const usuarios = readUsers(); // Lê o seu arquivo JSON

        // Encontra o usuário (usando == para evitar erro de string vs number)
        const usuario = usuarios.find(u => u.id == id);

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado no JSON" });
        }

        // Garante que retorne um array, mesmo que o campo favoritos não exista
        const favoritos = usuario.favoritos || [];
        console.log(`Favoritos do user ${id}:`, favoritos);

        res.status(200).json(favoritos);
    } catch (error) {
        console.error("Erro ao ler favoritos do JSON:", error);
        res.status(500).json({ mensagem: "Erro interno ao ler JSON" });
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
    const { nome, curso, componente, habilidade, plataforma, idioma } = req.query;
    const params = [];

    let query = `
      SELECT
        J.IDJOGO,
        J.NOME,
        J.LINKIMAGEM,
        J.DESCRICAOIMAGEM,
        J.LINK,
        J.IDIOMA,
        J.LICENSA,
        J.INTERACAO,

        GROUP_CONCAT(DISTINCT COMP.DESCRICAO SEPARATOR ', ') AS COMPONENTES,
        GROUP_CONCAT(DISTINCT P.DESCRICAO SEPARATOR ', ') AS PLATAFORMA_DESCRICAO,
        GROUP_CONCAT(DISTINCT H.codigoHabilidade SEPARATOR ', ') AS HABILIDADES_CODIGOS

      FROM JOGOS J
      LEFT JOIN jogos_componentes JC ON JC.IDJOGO = J.IDJOGO
      LEFT JOIN componentes COMP ON COMP.IDCOMPONENTE = JC.IDCOMPONENTE

      LEFT JOIN jogos_plataforma JP ON JP.IDJOGO = J.IDJOGO
      LEFT JOIN plataforma P ON P.IDPLATAFORMA = JP.IDPLATAFORMA

      LEFT JOIN jogos_habilidades JH ON JH.IDJOGO = J.IDJOGO
      LEFT JOIN habilidades H ON H.habilidadeID = JH.habilidadeID
    `;

    // curso (só se filtrar)
    if (curso) {
      query += `
        LEFT JOIN jogos_curso JCUR ON JCUR.IDJOGO = J.IDJOGO
        LEFT JOIN curso CUR ON CUR.IDCURSO = JCUR.IDCURSO
      `;
    }

    query += ` WHERE 1=1 `;

    if (nome) { query += ` AND J.NOME LIKE ?`; params.push(`${nome}%`); }
    if (idioma) { query += ` AND J.IDIOMA LIKE ?`; params.push(`%${idioma}%`); }
    if (curso) { query += ` AND CUR.DESCRICAO LIKE ?`; params.push(`%${curso}%`); }

    // filtro por componente (usa DESCRICAO)
    if (componente) {
      query += ` AND COMP.DESCRICAO LIKE ? `;
      params.push(`%${componente}%`);
    }

    // filtro por habilidade (código ou descrição)
    if (habilidade) {
      query += ` AND (H.codigoHabilidade LIKE ? OR H.descricaoHabilidade LIKE ?) `;
      params.push(`%${habilidade}%`, `%${habilidade}%`);
    }

    if (plataforma) {
      query += ` AND P.DESCRICAO LIKE ? `;
      params.push(`%${plataforma}%`);
    }

    query += ` GROUP BY J.IDJOGO `;

    const [rows] = await db.promise().query(query, params);
    console.log("EXEMPLO ROW:", rows[0]); // <- temporário p/ validar
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro no SQL detalhado:", error);
    res.status(500).json({ mensagem: "Erro ao buscar jogos no banco" });
  }
};

exports.getGameById = async (req, res) => {
    try {
        const id = req.params.id;

        const query = `
      SELECT
        J.IDJOGO,
        J.NOME,
        J.LINKIMAGEM,
        J.DESCRICAOIMAGEM,
        J.LINK,
        J.IDIOMA,
        J.LICENSA,
        J.INTERACAO,

        (SELECT GROUP_CONCAT(DISTINCT P.DESCRICAO SEPARATOR ', ')
         FROM JOGOS_PLATAFORMA JP
         JOIN PLATAFORMA P ON JP.IDPLATAFORMA = P.IDPLATAFORMA
         WHERE JP.IDJOGO = J.IDJOGO) AS PLATAFORMA_DESCRICAO,

        (SELECT GROUP_CONCAT(DISTINCT H.codigoHabilidade SEPARATOR ', ')
         FROM JOGOS_HABILIDADES JH
         JOIN HABILIDADES H ON JH.habilidadeID = H.habilidadeID
         WHERE JH.IDJOGO = J.IDJOGO) AS HABILIDADES_CODIGOS,

        (SELECT GROUP_CONCAT(DISTINCT COMP.DESCRICAO SEPARATOR ', ')
        FROM jogos_componentes JC
        JOIN componentes COMP ON JC.IDCOMPONENTE = COMP.IDCOMPONENTE
        WHERE JC.IDJOGO = J.IDJOGO) AS COMPONENTES


      FROM JOGOS J
      WHERE J.IDJOGO = ?
      LIMIT 1;
    `;

        const [rows] = await db.promise().query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ mensagem: "Jogo não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
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