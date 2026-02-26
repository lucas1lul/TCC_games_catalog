// /js/components/jogoCard.js

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Gera o HTML do card do jogo (padrão do catálogo)
 * @param {object} jogo
 * @param {object} options
 * @param {number[]} [options.favoritos]
 * @param {boolean} [options.mostrarEstrela]
 * @param {boolean} [options.mostrarBotaoDetalhes]
 * @param {boolean} [options.mostrarLink]
 * @param {function} [options.getImagem] - callback opcional p/ url da imagem
 */

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.renderJogoCard = function renderJogoCard(jogo, options = {}) {
  const {
    favoritos = [],
    mostrarEstrela = true,
    mostrarBotaoDetalhes = true,
    mostrarLink = true,
    getImagem
  } = options;

  const id = Number(jogo.IDJOGO);
  const classeAtiva = favoritos.includes(id) ? "ativa" : "";
  const urlImg = jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : `/images/placeholder.png`;  const nome = escapeHtml(jogo.NOME || "Sem título");
  const interacao = escapeHtml(jogo.INTERACAO || "N/A");
  const descricao = escapeHtml(jogo.DESCRICAOIMAGEM || "Sem descrição disponível.");
  const habilidadeTxt = escapeHtml(jogo.HABILIDADES_CODIGOS || "N/A");
  const plataformaTxt = escapeHtml(jogo.PLATAFORMA_DESCRICAO || "N/A");
  const componenteTxt = escapeHtml(jogo.COMPONENTES || jogo.COMPONENTES_DESCRICAO || "N/A");
  const link = jogo.LINK || "";

  return `
    <div class="jogo-card" data-jogo-id="${id}">
      <div class="card-image-container">
        <img src="${urlImg}" alt="${nome}" class="jogo-img">
      </div>

      <div class="card-content">
        <h2 class="jogo-titulo">${nome}</h2>
        <span class="jogo-componente">INTERAÇÃO: ${interacao}</span>
        
        <div class="card-body">
          <p class="jogo-descricao">${descricao}</p>
          <div class="detalhes-grid">
            <div class="detalhe-item"><strong>Habilidades:</strong> <span>${habilidadeTxt}</span></div>
            <div class="detalhe-item"><strong>Plataformas:</strong> <span>${plataformaTxt}</span></div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-icons">
          ${mostrarEstrela ? `<span class="estrela-favorito ${classeAtiva}" data-action="favoritar">❤</span>` : ''}
          ${mostrarBotaoDetalhes ? `<button class="btn-icon" data-action="detalhes" title="Ver Detalhes">🔍</button>` : ''}
          <span class="rating-stars">⭐⭐⭐⭐⭐</span>
        </div>

        ${mostrarLink ? `<a href="${link || "#"}" target="_blank" class="btn-acessar">${link ? "Acessar" : "Indisponível"}</a>` : ''}
      </div>
    </div>
  `;
};
