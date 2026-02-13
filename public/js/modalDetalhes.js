// /js/modalDetalhes.js

window.abrirDetalhes = async function abrirDetalhes(idJogo) {
  const modal = document.getElementById("modalDetalhes");
  if (!modal) {
    console.error("Modal não encontrado (modalDetalhes).");
    return;
  }

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
  await carregarAvaliacoesNoDetalhe(idJogo);
};

window.fecharModal = function fecharModal() {
  const modal = document.getElementById("modalDetalhes");
  if (modal) modal.style.display = "none";
};

window.addEventListener("click", (e) => {
  const modal = document.getElementById("modalDetalhes");
  if (modal && e.target === modal) modal.style.display = "none";
});
