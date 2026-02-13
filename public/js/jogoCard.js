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

  const urlImg = getImagem
    ? getImagem(jogo)
    : (jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : "/images/placeholder.png");

  const nome = escapeHtml(jogo.NOME || "Sem título");
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
        <div class="card-header-info">
          <h2 class="jogo-titulo">${nome}</h2>
          <span class="jogo-componente">INTERAÇÃO: ${interacao}</span>
        </div>

        <div class="card-body">
          <p class="jogo-descricao">${descricao}</p>

          <div class="detalhes-grid">
            <p class="detalhe-item"><strong>Habilidades:</strong> ${habilidadeTxt}</p>
            <p class="detalhe-item"><strong>Plataformas:</strong> ${plataformaTxt}</p>
            <p class="detalhe-item completo"><strong>Componentes:</strong> ${componenteTxt}</p>
          </div>
        </div>

        <div class="card-footer" style="display:flex; align-items:center; justify-content:space-between; gap:10px;">

  ${mostrarEstrela
      ? `<span class="estrela-favorito ${classeAtiva}"
              data-action="favoritar"
              aria-label="Favoritar jogo"
              title="Favoritar"
              style="font-size:18px; cursor:pointer;">
              ❤
         </span>`
      : `<span></span>`
    }

  ${mostrarBotaoDetalhes
      ? `<button class="btn-ver-mais" data-action="detalhes">
            🔍 Detalhes
         </button>`
      : ``
    }

  <!-- MÉDIA DAS AVALIAÇÕES -->
  <span class="media-avaliacao"
        data-media="true"
        style="white-space:nowrap; font-weight:bold;">
        <span data-media-valor>☆☆☆☆☆</span>
        <span data-media-total style="font-weight:normal; opacity:.75;"></span>
  </span>

  <!-- BOTÃO AVALIAR (APENAS SE LOGADO) -->
  ${localStorage.getItem("usuarioLogado")
      ? `<button class="btn-avaliar" data-action="avaliar">
            ⭐ Avaliar
         </button>`
      : ``
    }

  ${mostrarLink
      ? `<a href="${link || "#"}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-acessar"
            style="flex:1; text-align:right;">
            ${link ? "Acessar jogo" : "Link indisponível"}
         </a>`
      : ``
    }

</div>

      </div>
    </div>
  `;
};
