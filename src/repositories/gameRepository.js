const db = require('../config/db');

exports.findAll = async (filters = {}) => {
  const { nome, curso, componente, habilidade, plataforma, idioma } = filters;
  const params = [];

  // Removido o filtro de STATUS, pois agora tudo que está em JOGOS é considerado "oficial"
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

  // Começamos o WHERE com 1=1 para facilitar a concatenação de ANDs
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

  const [rows] = await db.promise().query(query, params);
  return rows;
};

exports.findById = async (id) => {
  const query = `SELECT * FROM JOGOS WHERE IDJOGO = ? LIMIT 1`;
  const [rows] = await db.promise().query(query, [id]);
  return rows[0];
};

exports.createGame = async (data) => {
  const { NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA } = data;

  // Removido STATUS da query de inserção da tabela JOGOS
  const sql = `
    INSERT INTO JOGOS (NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.promise().query(sql, [
    NOME,
    LINKIMAGEM,
    LINK,
    IDIOMA,
    INTERACAO,
    LICENSA
  ]);

  return result.insertId;
};

exports.remove = async (id) => {
  await db.promise().query("DELETE FROM JOGOS WHERE IDJOGO = ?", [id]);
};

exports.updateGame = async (id, data) => {
  const { nome, linkImagem, descricaoImagem, link, idioma, licensa, interacao } = data;

  const query = `
    UPDATE JOGOS
    SET
      NOME = ?,
      LINKIMAGEM = ?,
      DESCRICAOIMAGEM = ?,
      LINK = ?,
      IDIOMA = ?,
      LICENSA = ?,
      INTERACAO = ?
    WHERE IDJOGO = ?
  `;

  const params = [nome, linkImagem, descricaoImagem, link, idioma, licensa, interacao, id];
  const [result] = await db.promise().query(query, params);
  return result;
};

// --- NOVAS FUNÇÕES PARA A TABELA SUGESTOES_JOGOS ---

exports.createSuggestion = async (jogo) => {
  const sql = `
    INSERT INTO SUGESTOES_JOGOS (NOME_JOGO, LINK_ACESSO, JUSTIFICATIVA, STATUS, ID_USUARIO_SUGERIU) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [jogo.NOME, jogo.LINK, jogo.JUSTIFICATIVA, jogo.STATUS, jogo.ID_SUGERIDO_POR];
  
  const [result] = await db.promise().execute(sql, values);
  return result.insertId;
};

exports.findByUserId = async (usuarioId) => {
  const sql = `
    SELECT ID_SUGESTAO, NOME_JOGO, STATUS, DATA_ENVIO 
    FROM SUGESTOES_JOGOS 
    WHERE ID_USUARIO_SUGERIU = ? 
    ORDER BY DATA_ENVIO DESC
  `;
  const [rows] = await db.promise().query(sql, [usuarioId]);
  return rows;
};

// src/repositories/gameRepository.js

exports.findPending = async () => {
  // Removi o JOIN com USUARIOS, pois eles ainda estão no JSON
  const query = `
    SELECT 
      ID_SUGESTAO, 
      NOME_JOGO, 
      LINK_ACESSO, 
      JUSTIFICATIVA, 
      ID_USUARIO_SUGERIU AS AUTOR_ID 
    FROM SUGESTOES_JOGOS 
    WHERE STATUS = 'pendente'
  `;
  const [rows] = await db.promise().query(query);
  return rows;
};

exports.updateStatus = async (id, novoStatus) => {
  // Atualiza o status na tabela de sugestões
  const query = `UPDATE SUGESTOES_JOGOS SET STATUS = ? WHERE ID_SUGESTAO = ?`;
  const [result] = await db.promise().query(query, [novoStatus, id]);
  return result;
};