// /js/avaliacoes.js

let jogoIdParaAvaliar = null;
let notaAtual = 0;

// Reutilizando a lógica de estrelas clicáveis para o Modal
function montarEstrelas(containerId) {
    const box = document.getElementById(containerId);
    if (!box) return;

    box.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const s = document.createElement("button");
        s.type = "button";
        s.textContent = "★";
        s.className = "star-btn";
        s.setAttribute("aria-label", `Avaliar com ${i} estrelas`);
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
}

// CORREÇÃO: Usando a variável global do user.js e verificando perfil
window.abrirModalAvaliar = function (jogoId, nomeJogo) {
    if (!usuarioLogado) {
        alert("Você precisa estar logado para avaliar.");
        return;
    }

    // REGRA: Somente professor pode avaliar
    if (usuarioLogado.perfil !== 'professor') {
        alert("Apenas professores podem enviar avaliações pedagógicas.");
        return;
    }

    const modal = document.getElementById("modalAvaliar");
    if (!modal) return;

    jogoIdParaAvaliar = Number(jogoId);
    notaAtual = 0;

    document.getElementById("avaliarTitulo").textContent = `Avaliar: ${nomeJogo || "Jogo"}`;
    document.getElementById("comentarioAvaliacao").value = "";

    montarEstrelas("estrelasAvaliacao");
    atualizarEstrelasVisual("estrelasAvaliacao");
    modal.style.display = "block";
};

window.enviarAvaliacao = async function () {
    if (!notaAtual) return alert("Selecione uma nota de 1 a 5.");

    const payload = {
        jogoId: jogoIdParaAvaliar,
        // Opcional: O backend pode pegar o ID do usuário da sessão/cookie por segurança
        nota: notaAtual,
        comentario: document.getElementById("comentarioAvaliacao")?.value || ""
    };

    try {
        const res = await fetch("/api/avaliacoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fecharModalAvaliar();
            await atualizarMediaNoCard(jogoIdParaAvaliar);
            alert("Avaliação enviada! ✅");
        } else {
            const erro = await res.json();
            alert(erro.mensagem || "Erro ao enviar.");
        }
    } catch (err) {
        console.error(err);
    }
};

// ATUALIZAÇÃO: Média visual fiel com preenchimento parcial (CSS Gradient)
window.atualizarMediaNoCard = async function (jogoId) {
    const card = document.querySelector(`.jogo-card[data-jogo-id="${jogoId}"]`);
    if (!card) return;

    const starsEl = card.querySelector(".estrelas-dinamicas-card");
    const totalEl = card.querySelector(".nota-texto-card");

    try {
        const res = await fetch(`/api/games/${jogoId}/avaliacoes`);
        const { media, total } = await res.json();

        if (starsEl) {
            // Define a variável CSS que controla o preenchimento das estrelas
            const percent = (media / 5) * 100;
            starsEl.style.setProperty('--percent', `${percent}%`);
        }

        if (totalEl) {
            totalEl.textContent = total > 0 ? `(${media.toFixed(1)})` : "(S/N)";
        }
    } catch (err) {
        console.error("Erro ao atualizar média:", err);
    }
};

window.carregarAvaliacoesNoDetalhe = async function (jogoId) {
    const res = await fetch(`/api/games/${jogoId}/avaliacoes`);
    const { media, total, comentarios } = await res.json();

    const mediaBox = document.getElementById("detalheMedia");
    if (mediaBox) mediaBox.textContent = total ? `${media.toFixed(1)} / 5 (${total} avaliações)` : "Sem avaliações.";

    const lista = document.getElementById("listaComentarios");
    if (!lista) return;

    // Mostra do mais recente para o mais antigo (o backend já deve vir ordenado)
    lista.innerHTML = comentarios.map(c => `
        <div class="comentario-item">
            <div class="comentario-header">
                <strong>${c.usuarioNome}</strong>
                <span>⭐ ${c.nota}/5</span>
            </div>
            <div class="comentario-data">${new Date(c.createdAt).toLocaleDateString()}</div>
            <div class="comentario-texto">${c.comentario || "<em>Sem comentário</em>"}</div>
        </div>
    `).join("");
};

window.fecharModalAvaliar = function () {
    const modal = document.getElementById("modalAvaliar");
    if (modal) modal.style.display = "none";
    jogoIdParaAvaliar = null; // Limpa o estado
    notaAtual = 0;
};

// Fechar ao clicar fora do conteúdo do modal
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modalAvaliar");
    if (e.target === modal) fecharModalAvaliar();
});