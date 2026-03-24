const db = require('../config/db');

exports.findAll = async (filters = {}) => {
  const { nome, curso, componente, habilidade, plataforma, idioma } = filters;
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
  if (componente) { query += ` AND COMP.DESCRICAO LIKE ?`; params.push(`%${componente}%`); }
  if (habilidade) {
    query += ` AND (H.codigoHabilidade LIKE ? OR H.descricaoHabilidade LIKE ?) `;
    params.push(`%${habilidade}%`, `%${habilidade}%`);
  }
  if (plataforma) {
    query += ` AND P.DESCRICAO LIKE ? `;
    params.push(`%${plataforma}%`);
  }

  query += ` GROUP BY J.IDJOGO `;

  // Removido .promise() - Chamada direta
  const [rows] = await db.query(query, params);
  return rows;
};

exports.findById = async (id) => {
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

      GROUP_CONCAT(DISTINCT G.DESCRICAO SEPARATOR ', ') AS GENERO_DESCRICAO,
      GROUP_CONCAT(DISTINCT P.DESCRICAO SEPARATOR ', ') AS PLATAFORMA_DESCRICAO,
      GROUP_CONCAT(DISTINCT H.codigoHabilidade SEPARATOR ', ') AS HABILIDADES_CODIGOS

    FROM JOGOS J

    -- 🎭 GENERO
    LEFT JOIN jogos_genero JG ON JG.IDJOGO = J.IDJOGO
    LEFT JOIN genero G ON G.IDGENERO = JG.IDGENERO

    -- 🎮 PLATAFORMA
    LEFT JOIN jogos_plataforma JP ON JP.IDJOGO = J.IDJOGO
    LEFT JOIN plataforma P ON P.IDPLATAFORMA = JP.IDPLATAFORMA

    -- 🎯 HABILIDADES
    LEFT JOIN jogos_habilidades JH ON JH.IDJOGO = J.IDJOGO
    LEFT JOIN habilidades H ON H.habilidadeID = JH.habilidadeID

    WHERE J.IDJOGO = ?
    GROUP BY J.IDJOGO
    LIMIT 1
  `;

  const [rows] = await db.promise().query(query, [id]);
  return rows[0];
};

exports.createGame = async (data) => {
    const { NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA, HABILIDADES, GENERO, PLATAFORMA, COMPONENTE } = data;

    // Pega uma conexão exclusiva para a transação
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction(); // Inicia a transação

        // 1. Insere o jogo na tabela principal
        const sqlGame = `
            INSERT INTO JOGOS (NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(sqlGame, [NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA]);
        const novoJogoId = result.insertId;

        // 2. Insere as relações (apenas se o admin tiver selecionado alguma)
        if (HABILIDADES.length > 0) {
            for (const habId of HABILIDADES) {
                await connection.execute('INSERT INTO jogos_habilidades (IDJOGO, habilidadeID) VALUES (?, ?)', [novoJogoId, habId]);
            }
        }
        if (GENERO.length > 0) {
            for (const genId of GENERO) {
                await connection.execute('INSERT INTO jogos_genero (IDJOGO, IDGENERO) VALUES (?, ?)', [novoJogoId, genId]);
            }
        }
        if (PLATAFORMA.length > 0) {
            for (const platId of PLATAFORMA) {
                await connection.execute('INSERT INTO jogos_plataforma (IDJOGO, IDPLATAFORMA) VALUES (?, ?)', [novoJogoId, platId]);
            }
        }
        if (COMPONENTE.length > 0) {
            for (const compId of COMPONENTE) {
                await connection.execute('INSERT INTO jogos_componentes (IDJOGO, IDCOMPONENTE) VALUES (?, ?)', [novoJogoId, compId]);
            }
        }

        // Tudo ocorreu bem, confirma as alterações no banco
        await connection.commit();
        
        return novoJogoId; // Retorna o ID gerado

    } catch (error) {
        // Se der qualquer erro em qualquer passo, ele desfaz tudo (rollback)
        if (connection) await connection.rollback();
        throw error;
    } finally {
        // Libera a conexão de volta para o Pool
        if (connection) connection.release();
    }
};

exports.remove = async (id) => {
  await db.query("DELETE FROM JOGOS WHERE IDJOGO = ?", [id]);
};

exports.updateGame = async (id, data) => {
  const { nome, linkImagem, descricaoImagem, link, idioma, licensa, interacao } = data;
  const query = `
    UPDATE JOGOS
    SET NOME = ?, LINKIMAGEM = ?, DESCRICAOIMAGEM = ?, LINK = ?, IDIOMA = ?, LICENSA = ?, INTERACAO = ?
    WHERE IDJOGO = ?
  `;
  const params = [nome, linkImagem, descricaoImagem, link, idioma, licensa, interacao, id];
  const [result] = await db.query(query, params);
  return result;
};

// --- FUNÇÕES PARA SUGESTOES_JOGOS ---

exports.createSuggestion = async (jogo) => {
  const sql = `
    INSERT INTO SUGESTOES_JOGOS (NOME_JOGO, LINK_ACESSO, JUSTIFICATIVA, STATUS, ID_USUARIO_SUGERIU) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [jogo.NOME, jogo.LINK, jogo.JUSTIFICATIVA, jogo.STATUS, jogo.ID_SUGERIDO_POR];
  const [result] = await db.execute(sql, values);
  return result.insertId;
};

exports.findByUserId = async (usuarioId) => {
  const sql = `
    SELECT ID_SUGESTAO, NOME_JOGO, STATUS, DATA_ENVIO 
    FROM SUGESTOES_JOGOS 
    WHERE ID_USUARIO_SUGERIU = ? 
    ORDER BY DATA_ENVIO DESC
  `;
  const [rows] = await db.query(sql, [usuarioId]);
  return rows;
};

exports.findPending = async () => {
  const query = `
    SELECT ID_SUGESTAO, NOME_JOGO, LINK_ACESSO, JUSTIFICATIVA, ID_USUARIO_SUGERIU AS AUTOR_ID 
    FROM SUGESTOES_JOGOS 
    WHERE STATUS = 'pendente'
  `;
  const [rows] = await db.query(query);
  return rows;
};

exports.updateStatus = async (id, novoStatus) => {
  const query = `UPDATE SUGESTOES_JOGOS SET STATUS = ? WHERE ID_SUGESTAO = ?`;
  const [result] = await db.query(query, [novoStatus, id]);
  return result;
};

exports.buscarEnviosPorUsuario = async (usuarioId) => {
  try {
    const query = `
      SELECT ID_SUGESTAO, NOME_JOGO, DATA_ENVIO, STATUS 
      FROM SUGESTOES_JOGOS 
      WHERE ID_USUARIO_SUGERIU = ? 
      ORDER BY DATA_ENVIO DESC
    `;
    const [rows] = await db.execute(query, [usuarioId]);
    return rows;
  } catch (error) {
    console.error("Erro no Repository [buscarEnviosPorUsuario]:", error);
    throw error;
  }
};

exports.searchHabilidades = async (termo) => {
  try {
    const query = `
      SELECT 
        habilidadeID AS ID, 
        codigoHabilidade AS CODIGO, 
        descricaoHabilidade AS NOME 
      FROM habilidades 
      WHERE codigoHabilidade LIKE ? OR descricaoHabilidade LIKE ? 
      LIMIT 10
    `;
    const params = [`%${termo}%`, `%${termo}%`];
    
    // Usando .execute ou .query conforme seu padrão
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Erro no Repository [searchHabilidades]:", error);
    throw error;
  }
};