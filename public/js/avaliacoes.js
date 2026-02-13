// /js/avaliacoes.js

let jogoIdParaAvaliar = null;
let notaAtual = 0;

function montarEstrelas(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;

    box.innerHTML = "";
    box.style.display = "flex";
    box.style.gap = "6px";

    for (let i = 1; i <= 5; i++) {
        const s = document.createElement("button");
        s.type = "button";
        s.textContent = "★";
        s.setAttribute("aria-label", `${i} estrelas`);
        s.style.fontSize = "24px";
        s.style.background = "transparent";
        s.style.border = "none";
        s.style.cursor = "pointer";
        s.style.color = "#ccc";

        s.addEventListener("click", () => {
            notaAtual = i;
            atualizarEstrelasVisual(containerId);
        });

        box.appendChild(s);
    }
}

function atualizarEstrelasVisual(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;

    [...box.children].forEach((btn, idx) => {
        btn.style.color = (idx + 1) <= notaAtual ? "gold" : "#ccc";
    });

    const notaEl = document.getElementById("notaSelecionada");
    if (notaEl) notaEl.textContent = notaAtual ? `${notaAtual}/5` : "—";
}

window.abrirModalAvaliar = function abrirModalAvaliar(jogoId, nomeJogo) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
        alert("Você precisa estar logado para avaliar.");
        return;
    }

    const modal = document.getElementById("modalAvaliar");
    if (!modal) return;

    jogoIdParaAvaliar = Number(jogoId);
    notaAtual = 0;

    const titulo = document.getElementById("avaliarTitulo");
    if (titulo) titulo.textContent = `Avaliar: ${nomeJogo || "Jogo"}`;

    const textarea = document.getElementById("comentarioAvaliacao");
    if (textarea) textarea.value = "";

    montarEstrelas("estrelasAvaliacao");
    atualizarEstrelasVisual("estrelasAvaliacao");

    modal.style.display = "block";
};

window.fecharModalAvaliar = function fecharModalAvaliar() {
    const modal = document.getElementById("modalAvaliar");
    if (modal) modal.style.display = "none";
};

window.enviarAvaliacao = async function enviarAvaliacao() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) return alert("Você precisa estar logado.");

    if (!jogoIdParaAvaliar) return alert("Jogo inválido.");
    if (!notaAtual) return alert("Selecione uma nota de 1 a 5.");

    const comentario = document.getElementById("comentarioAvaliacao")?.value || "";

    const payload = {
        jogoId: jogoIdParaAvaliar,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        nota: notaAtual,
        comentario
    };

    const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        return alert(t.mensagem || "Erro ao enviar avaliação.");
    }

    fecharModalAvaliar();

    // Atualiza média no card e comentários no modal de detalhes (se estiver aberto)
    await atualizarMediaNoCard(jogoIdParaAvaliar);
    if (document.getElementById("modalDetalhes")?.style.display === "block") {
        await carregarAvaliacoesNoDetalhe(jogoIdParaAvaliar);
    }

    alert("Avaliação enviada! ✅");
};

async function fetchResumoAvaliacoes(jogoId) {
    const res = await fetch(`/api/games/${jogoId}/avaliacoes`);
    if (!res.ok) return { media: 0, total: 0, comentarios: [] };
    return await res.json();
}

function estrelasPorMedia(media) {
    // media 0..5 -> arredonda para meio ponto (opcional)
    const m = Math.max(0, Math.min(5, Number(media || 0)));
    const cheias = Math.round(m); // simples: arredonda inteiro
    const vazias = 5 - cheias;
    return "★".repeat(cheias) + "☆".repeat(vazias);
}

window.atualizarMediaNoCard = async function atualizarMediaNoCard(jogoId) {
    const card = document.querySelector(`.jogo-card[data-jogo-id="${jogoId}"]`);
    if (!card) return;

    const mediaEl = card.querySelector("[data-media-valor]");
    const totalEl = card.querySelector("[data-media-total]");

    const res = await fetch(`/api/games/${jogoId}/avaliacoes`);
    if (!res.ok) {
        if (mediaEl) mediaEl.textContent = "☆☆☆☆☆";
        if (totalEl) totalEl.textContent = "";
        return;
    }

    const { media, total } = await res.json();

    if (!total) {
        if (mediaEl) mediaEl.textContent = "☆☆☆☆☆"; // ✅ 5 estrelas quando não tem avaliação
        if (totalEl) totalEl.textContent = "";
        return;
    }

    if (mediaEl) mediaEl.textContent = estrelasPorMedia(media);
    if (totalEl) totalEl.textContent = `(${total})`;
};

window.carregarAvaliacoesNoDetalhe = async function carregarAvaliacoesNoDetalhe(jogoId) {
    const { media, total, comentarios } = await fetchResumoAvaliacoes(jogoId);

    // média no detalhe
    const mediaBox = document.getElementById("detalheMedia");
    if (mediaBox) mediaBox.textContent = total ? `${media.toFixed(1)} / 5 (${total} avaliações)` : "Sem avaliações ainda.";

    // comentários no detalhe
    const lista = document.getElementById("listaComentarios");
    if (!lista) return;

    if (!comentarios.length) {
        lista.innerHTML = "<p style='opacity:.8;'>Nenhum comentário ainda.</p>";
        return;
    }

    lista.innerHTML = comentarios.map(c => `
    <div style="border-top:1px solid #eee; padding:10px 0;">
      <div style="display:flex; justify-content:space-between; gap:10px;">
        <strong>${c.usuarioNome}</strong>
        <span style="white-space:nowrap;">⭐ ${c.nota}/5</span>
      </div>
      <div style="font-size:.85rem; opacity:.75;">${new Date(c.createdAt).toLocaleString()}</div>
      <div style="margin-top:6px;">${(c.comentario || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;") || "<em style='opacity:.75;'>Sem comentário</em>"}</div>
    </div>
  `).join("");
};

// fechar modal ao clicar fora
window.addEventListener("click", (e) => {
    const m = document.getElementById("modalAvaliar");
    if (m && e.target === m) m.style.display = "none";
});
