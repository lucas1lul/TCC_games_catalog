// my_games.js

// Variáveis globais
let meusJogosOriginais = [];
let jogosFiltrados = [];
let usuarioLogado = null;

document.addEventListener("DOMContentLoaded", () => {
  const usuarioSessao = localStorage.getItem("usuarioLogado");

  if (!usuarioSessao) {
    alert("Acesso negado. Por favor, faça login.");
    window.location.href = "/index.html";
    return;
  }

  usuarioLogado = JSON.parse(usuarioSessao);

  // displays (se existirem)
  const nomeEl = document.getElementById("nomeDisplay");
  const perfilEl = document.getElementById("perfilDisplay");
  if (nomeEl) nomeEl.textContent = usuarioLogado.nome || "";
  if (perfilEl) perfilEl.textContent = usuarioLogado.perfil || "";

  configurarInterfacePorPerfil((usuarioLogado.perfil || "").toLowerCase());

  // listeners de filtro (se existirem)
  const filtroStatus = document.getElementById("filtroStatus");
  const filtroCurso = document.getElementById("filtroCurso");

  if (filtroStatus) filtroStatus.addEventListener("change", filtrarMeusJogos);
  if (filtroCurso) filtroCurso.addEventListener("input", filtrarMeusJogos);

  // Delegação de clique nos cards (Detalhes/Favoritar)
  const container = document.getElementById("listaFavoritos");
  if (container) {
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".jogo-card");
      if (!card) return;

      const idJogo = Number(card.dataset.jogoId);
      if (!Number.isFinite(idJogo)) return;

      // Detalhes
      if (e.target.closest('[data-action="detalhes"]')) {
        if (typeof window.abrirDetalhes === "function") {
          window.abrirDetalhes(idJogo);
        } else {
          console.warn("abrirDetalhes não existe nesta página.");
        }
        return;
      }

      // Favoritar
      if (e.target.closest('[data-action="favoritar"]')) {
        toggleFavorito(idJogo, e.target.closest('[data-action="favoritar"]'));
        return;
      }
    });
  }

  carregarMeusDados();
});

// --- LÓGICA DE INTERFACE ---
function configurarInterfacePorPerfil(perfil) {
  const secaoProfessor = document.getElementById("secaoProfessor");
  if (!secaoProfessor) return;

  if (perfil.includes("professor") || perfil.includes("administrador")) {
    secaoProfessor.classList.add("mostrar-gestao");
  } else {
    secaoProfessor.classList.remove("mostrar-gestao");
  }
}

// --- FILTROS ---
function filtrarMeusJogos() {
  const status = document.getElementById("filtroStatus")?.value || "tudo";
  const busca = (document.getElementById("filtroCurso")?.value || "").toLowerCase().trim();

  jogosFiltrados = meusJogosOriginais.filter((jogo) => {
    // Como hoje seus favoritos vêm do endpoint, todos aqui já são favoritados
    const matchStatus =
      status === "tudo" ||
      status === "favoritados" ||
      (status === "avaliados" && jogo.isAvaliado);

    const nome = (jogo.NOME || "").toLowerCase();
    const matchTexto = !busca || nome.includes(busca);

    return matchStatus && matchTexto;
  });

  renderizarJogos(jogosFiltrados);
}

// --- RENDERIZAÇÃO ---
function renderizarJogos(lista) {
  const container = document.getElementById("listaFavoritos");
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(lista) || lista.length === 0) {
    container.innerHTML = "<p>Nenhum jogo encontrado.</p>";
    return;
  }

  const favoritos = usuarioLogado?.favoritos || [];

  lista.forEach((jogo) => {
    container.innerHTML += renderJogoCard(jogo, {
      favoritos,
      mostrarEstrela: true,
      mostrarBotaoDetalhes: true,
      mostrarLink: true,
    });
  });
}

// --- COMUNICAÇÃO COM API ---
async function carregarMeusDados() {
  const container = document.getElementById("listaFavoritos");
  if (container) container.innerHTML = "Carregando...";

  try {
    // 1) IDs favoritados (vindo do backend)
    const responseFav = await fetch(`/api/usuarios/${usuarioLogado.id}/favoritos`);
    if (!responseFav.ok) throw new Error("Falha ao carregar favoritos");
    const idsFavoritos = await responseFav.json();

    // normaliza para número
    const setIds = new Set((idsFavoritos || []).map((x) => Number(x)).filter(Number.isFinite));

    // 2) todos os jogos
    const responseJogos = await fetch("/api/games");
    if (!responseJogos.ok) throw new Error("Falha ao carregar jogos");
    const todosJogos = await responseJogos.json();

    // 3) filtra só os favoritados
    meusJogosOriginais = (todosJogos || []).filter((j) => setIds.has(Number(j.IDJOGO)));

    jogosFiltrados = [...meusJogosOriginais];

    if (meusJogosOriginais.length === 0) {
      if (container) container.innerHTML = "<p>Você ainda não favoritou nenhum jogo. ❤️</p>";
      return;
    }

    renderizarJogos(jogosFiltrados);
  } catch (error) {
    console.error("Erro ao carregar meus jogos:", error);
    if (container) {
      container.innerHTML =
        '<p style="color:red">❌ Erro ao carregar Meus Jogos. Verifique o console.</p>';
    }
  }
}

// --- FAVORITAR (reaproveita a mesma rota do catálogo) ---
async function toggleFavorito(jogoId, elementoEstrela) {
  const usuarioLogadoLocal = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogadoLocal) {
    alert("Você precisa estar logado para favoritar!");
    return;
  }

  try {
    const response = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: usuarioLogadoLocal.id,
        jogoId: jogoId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // atualiza storage + UI
      usuarioLogadoLocal.favoritos = data.favoritos;
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogadoLocal));
      usuarioLogado = usuarioLogadoLocal;

      // se o usuário desfavoritou, remove da lista de "Meus jogos"
      const aindaFavoritado = (data.favoritos || []).map(Number).includes(Number(jogoId));
      if (!aindaFavoritado) {
        meusJogosOriginais = meusJogosOriginais.filter((j) => Number(j.IDJOGO) !== Number(jogoId));
        filtrarMeusJogos(); // re-render respeitando filtros
      } else {
        elementoEstrela.classList.toggle("ativa");
      }
    }
  } catch (error) {
    console.error("Erro ao favoritar:", error);
  }
}

// --- EXPORT CSV (opcional) ---
// OBS: só funciona se você tiver checkboxes no HTML com .check-jogo e data-id
function exportarLista() {
  const checkboxes = document.querySelectorAll(".check-jogo:checked");
  const idsSelecionados = Array.from(checkboxes)
    .map((cb) => Number(cb.dataset.id))
    .filter(Number.isFinite);

  if (idsSelecionados.length === 0) {
    alert("Selecione ao menos um jogo para exportar.");
    return;
  }

  const dadosParaExportar = meusJogosOriginais.filter((j) => idsSelecionados.includes(Number(j.IDJOGO)));

  let csvContent = "\uFEFFID;Titulo;Link;Idioma\n";
  dadosParaExportar.forEach((j) => {
    csvContent += `${j.IDJOGO};${(j.NOME || "").replaceAll(";", ",")};${j.LINK || ""};${j.IDIOMA || ""}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "meus_jogos_selecionados.csv";
  link.click();
}

// --- LOGOUT ---
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "/index.html";
}

// expõe ações se você chamar via HTML
window.exportarLista = exportarLista;
window.logout = logout;
