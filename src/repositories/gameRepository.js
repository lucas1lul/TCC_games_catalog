const db = require('../config/db');

exports.findAll = async (filters) => {
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

  const [rows] = await db.promise().query(query, params);
  return rows;
};

exports.findById = async (id) => {
  const query = `
    SELECT *
    FROM JOGOS
    WHERE IDJOGO = ?
    LIMIT 1
  `;

  const [rows] = await db.promise().query(query, [id]);
  return rows[0];
};

exports.create = async (data) => {
  const { NOME, LINKIMAGEM, LINK, IDIOMA, INTERACAO, LICENSA } = data;

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
