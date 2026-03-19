let usuarioLogado = null;

function setStatus(msg, type = "info") {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "status " + type;
    setTimeout(() => { el.textContent = ""; el.className = "status"; }, 5000);
}

// 1. Busca dados da sessão real no servidor
async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user; // Espera { user: {...} } do servidor
    } catch (e) {
        return null;
    }
}

async function carregarDadosIniciais() {
    usuarioLogado = await verificarSessao();
    
    if (!usuarioLogado) {
        window.location.href = "/login";
        return;
    }

    // Preenche formulário de perfil
    document.getElementById("nome").value = usuarioLogado.nome || "";
    document.getElementById("email").value = usuarioLogado.email || "";

    // 2. Se for admin, mostra as opções de menu de administração
    if (usuarioLogado.perfil === 'administrador') {
    document.getElementById("menu-admin").style.display = "block";
} else if (usuarioLogado.perfil === 'profissional_ti') {
    document.getElementById("menu-ti").style.display = "block";
}
}

// Troca de abas no dashboard
function showSection(sectionId, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (sectionId === 'section-curadoria') carregarSugestoes();
}

async function salvarAlteracoes(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarNovaSenha").value;

    let payload = { id: usuarioLogado.id, nome, email };

    if (senhaAtual || novaSenha) {
        if (novaSenha !== confirmar) return setStatus("As senhas não conferem!", "error");
        if (novaSenha.length < 6) return setStatus("Nova senha muito curta!", "error");
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
    }

    try {
        const res = await fetch("/api/users/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setStatus("Dados atualizados com sucesso!", "success");
            document.getElementById("senhaAtual").value = "";
            document.getElementById("novaSenha").value = "";
            document.getElementById("confirmarNovaSenha").value = "";
        } else {
            const err = await res.json();
            throw new Error(err.message || "Erro ao atualizar");
        }
    } catch (err) {
        setStatus(err.message, "error");
    }
}

async function cadastrarJogo(e) {
    e.preventDefault();
    const jogo = {
        nome: document.getElementById("nome_jogo").value,
        link: document.getElementById("link_acesso").value,
        linkimagem: document.getElementById("linkimagem").value,
        idioma: document.getElementById("idioma").value,
        interacao: document.getElementById("interacao").value,
        licensa: document.getElementById("licensa").value
    };

    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jogo),
            credentials: 'include'
        });

        if (response.ok) {
            alert("Jogo cadastrado com sucesso!");
            location.reload();
        } else {
            const result = await response.json();
            alert("Erro: " + (result.error || result.message));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

async function carregarSugestoes() {
    try {
        const res = await fetch('/api/games/pending');
        const sugestoes = await res.json();
        const tabela = document.getElementById("tabela-sugestoes");
        
        if (sugestoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3">Nenhuma sugestão pendente.</td></tr>';
            return;
        }

        tabela.innerHTML = sugestoes.map(s => `
            <tr>
                <td>${s.NOME}</td>
                <td><a href="${s.LINK}" target="_blank">Visualizar Jogo</a></td>
                <td>
                    <button class="btn-approve" onclick="prepararAprovacao('${s.IDJOGO}', '${s.NOME}', '${s.LINK}')">✅ Aprovar</button>
                    <button class="btn-reject" onclick="rejeitarSugestao('${s.IDJOGO}')">❌</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar sugestões:", err);
    }
}

// ADMIN: Quando clica em Aprovar, os dados sobem para o formulário de Cadastro Real
function prepararAprovacao(id, nome, link) {
    // 1. Muda para a seção de cadastro
    const btnCadastro = document.querySelector('[onclick*="section-cadastro-jogo"]');
    showSection('section-cadastro-jogo', btnCadastro);

    // 2. Preenche o formulário de cadastro oficial com os dados da sugestão
    document.getElementById("nome_jogo").value = nome;
    document.getElementById("link_acesso").value = link;

    // 3. Opcional: Guardamos o ID da sugestão para deletar/atualizar status depois de salvar o cadastro real
    window.idSugestaoEmFoco = id;
    
    alert("Dados carregados! Complete as informações técnicas (Idioma, Interação, etc) para finalizar o cadastro.");
}

// ADMIN: Rejeitar a sugestão diretamente
async function rejeitarSugestao(id) {
    if (!confirm("Deseja realmente rejeitar esta sugestão?")) return;

    try {
        const res = await fetch(`/api/games/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'rejeitado' })
        });

        if (res.ok) {
            alert("Sugestão rejeitada.");
            carregarSugestoes(); // Atualiza a tabela
        }
    } catch (err) {
        alert("Erro ao processar rejeição.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    document.getElementById("formConta").addEventListener("submit", salvarAlteracoes);
    const formJogo = document.getElementById("formCadastroJogo");
    if (formJogo) formJogo.addEventListener("submit", cadastrarJogo);
});