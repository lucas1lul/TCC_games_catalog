// catalogo.js
document.addEventListener("DOMContentLoaded", () => {
  carregarJogos();

  const formFiltros = document.getElementById("filtros");
  if (formFiltros) {
    // IMPORTANTE: #filtros precisa ser <form> no HTML para "Enter" funcionar
    formFiltros.addEventListener("submit", (e) => {
      e.preventDefault();
      carregarJogos();
    });
  }

  // Clique em Detalhes / Favoritar (delegação)
  const lista = document.getElementById("lista");
  if (lista) {
    lista.addEventListener("click", (e) => {
      const card = e.target.closest(".jogo-card");
      if (!card) return;

      const idJogo = Number(card.dataset.jogoId);
      if (!Number.isFinite(idJogo)) return;

      // Detalhes
      if (e.target.closest('[data-action="detalhes"]')) {
        abrirDetalhes(idJogo);
        return;
      }

      // Favoritar
      if (e.target.closest('[data-action="favoritar"]')) {
        toggleFavorito(idJogo, e.target.closest('[data-action="favoritar"]'));
        return;
      }
    });
  }

  // Saudação (opcional)
  const usuarioSessao = localStorage.getItem("usuarioLogado");
  if (usuarioSessao) {
    const header = document.querySelector("h1");
    if (header) {
      const saudacao = document.createElement("p");
      saudacao.style.fontSize = "1rem";
      saudacao.style.color = "#555";
      header.insertAdjacentElement("afterend", saudacao);
    }
  }
});

let jogosCompletos = [];
let paginaAtual = 1;
const jogosPorPagina = 12;

async function carregarJogos() {
  const curso = (document.getElementById("filtroCurso")?.value || "").trim();
  const componente = (document.getElementById("filtroComponente")?.value || "").trim();
  const habilidade = (document.getElementById("filtroHabilidade")?.value || "").trim();
  const plataforma = (document.getElementById("filtroPlataforma")?.value || "").trim();

  const lista = document.getElementById("lista");
  if (!lista) return;

  paginaAtual = 1;
  jogosCompletos = [];
  lista.innerHTML = "Carregando resultados...";

  const params = new URLSearchParams();
  if (curso) params.set("curso", curso);
  if (componente) params.set("componente", componente);
  if (habilidade) params.set("habilidade", habilidade);
  if (plataforma) params.set("plataforma", plataforma);

  const url = params.toString() ? `/api/games?${params.toString()}` : "/api/games";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);

    jogosCompletos = await res.json();

    if (!Array.isArray(jogosCompletos) || jogosCompletos.length === 0) {
      lista.innerHTML = "⚠️ Nenhum jogo encontrado.";
      atualizarControlesPaginacao();
      return;
    }

    renderizarJogosDaPagina();
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    lista.innerHTML = "❌ Erro ao carregar dados.";
    atualizarControlesPaginacao();
  }
}

function renderizarJogosDaPagina() {
  const lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = "";

  const inicio = (paginaAtual - 1) * jogosPorPagina;
  const fim = inicio + jogosPorPagina;
  const jogosDaPagina = jogosCompletos.slice(inicio, fim);

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const favoritos = usuarioLogado?.favoritos || [];

  jogosDaPagina.forEach((jogo) => {
    // ✅ Usa o componente reaproveitável
    lista.innerHTML += renderJogoCard(jogo, { favoritos });
  });

  atualizarControlesPaginacao();
}

function mudarPagina(direcao) {
  const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
  const novaPagina = paginaAtual + direcao;
  if (novaPagina >= 1 && novaPagina <= totalPaginas) {
    paginaAtual = novaPagina;
    renderizarJogosDaPagina();
    document.getElementById("lista")?.scrollIntoView({ behavior: "smooth" });
  }
}

function atualizarControlesPaginacao() {
  const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
  const btnAnterior = document.getElementById("btnAnterior");
  const btnProximo = document.getElementById("btnProximo");
  const infoPagina = document.getElementById("infoPagina");

  if (btnAnterior) btnAnterior.disabled = paginaAtual === 1;
  if (btnProximo) btnProximo.disabled = paginaAtual === totalPaginas || jogosCompletos.length === 0;
  if (infoPagina) infoPagina.textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
}

async function toggleFavorito(jogoId, elementoEstrela) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alert("Você precisa estar logado para favoritar!");
    return;
  }

  try {
    const response = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: usuarioLogado.id,
        jogoId: jogoId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      elementoEstrela.classList.toggle("ativa");
      usuarioLogado.favoritos = data.favoritos;
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
    }
  } catch (error) {
    console.error("Erro ao favoritar:", error);
  }
}

async function abrirDetalhes(idJogo) {
  const modal = document.getElementById("modalDetalhes");
  if (!modal) return;

  modal.style.display = "block";

  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = (v == null || v === "") ? "N/A" : String(v);
  };

  set("modalTitulo", "Carregando...");
  set("modalHabilidades", "Carregando...");
  set("modalGenero", "Carregando...");
  set("modalIdioma", "Carregando...");
  set("modalPlataforma", "Carregando...");
  set("modalLicenca", "Carregando...");
  set("modalInteracao", "Carregando...");

  const imgEl = document.getElementById("modalImg");
  if (imgEl) imgEl.src = "/images/placeholder.png";

  try {
    const res = await fetch(`/api/games/${idJogo}`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    const jogo = await res.json();

    set("modalTitulo", jogo.NOME);
    set("modalHabilidades", jogo.HABILIDADES_CODIGOS);
    set("modalPlataforma", jogo.PLATAFORMA_DESCRICAO);
    set("modalIdioma", jogo.IDIOMA);
    set("modalLicenca", jogo.LICENSA);
    set("modalInteracao", jogo.INTERACAO);
    set("modalGenero", jogo.GENERO_DESCRICAO || "N/A");

    if (imgEl) {
      imgEl.src = jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : "/images/placeholder.png";
      imgEl.alt = jogo.NOME || "Capa do Jogo";
    }
  } catch (err) {
    console.error(err);
    set("modalTitulo", "Erro ao carregar");
    set("modalHabilidades", "Erro ao carregar");
    set("modalGenero", "Erro ao carregar");
    set("modalIdioma", "Erro ao carregar");
    set("modalPlataforma", "Erro ao carregar");
    set("modalLicenca", "Erro ao carregar");
    set("modalInteracao", "Erro ao carregar");
  }
}

function fecharModal() {
  const modal = document.getElementById("modalDetalhes");
  if (modal) modal.style.display = "none";
}

// fecha ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modalDetalhes");
  if (modal && e.target === modal) modal.style.display = "none";
});

// Expondo funções usadas no HTML (paginacao e fechar)
window.mudarPagina = mudarPagina;
window.fecharModal = fecharModal;
