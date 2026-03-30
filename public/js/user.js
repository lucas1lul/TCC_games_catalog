let usuarioLogado = null;
let habilidadesSelecionadas = [];

// --- UTILITÁRIOS ---

function setStatus(msg, type = "info") {
    const el = document.getElementById("status");
    if (!el) return;

    el.textContent = msg || "";
    el.className = "status " + type;

    setTimeout(() => {
        el.textContent = "";
        el.className = "status";
    }, 5000);
}

// --- SESSÃO ---

async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch {
        return null;
    }
}

async function carregarDadosIniciais() {
    usuarioLogado = await verificarSessao();

    if (!usuarioLogado) {
        window.location.href = "/login";
        return;
    }

    document.getElementById("nome") && (document.getElementById("nome").value = usuarioLogado.nome || "");
    document.getElementById("email") && (document.getElementById("email").value = usuarioLogado.email || "");

    if (usuarioLogado.perfil === 'administrador') {
        document.getElementById("menu-admin").hidden = false;
    } else if (usuarioLogado.perfil === 'profissional_ti') {
        document.getElementById("menu-ti").hidden = false;
    }
}

// --- BUSCA DE HABILIDADES ---

function configurarBuscaHabilidades() {
    const input = document.getElementById('buscaHabilidade');
    const lista = document.getElementById('resultadosBusca');

    if (!input) return;

    input.addEventListener('input', async (e) => {
        const termo = e.target.value;

        if (termo.length < 2) {
            lista.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`/api/habilidades/search?q=${termo}`);
            const dados = await res.json();

            lista.innerHTML = '';

            dados.forEach(h => {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.textContent = `${h.CODIGO} - ${h.NOME}`;
                div.onclick = () => adicionarTagHabilidade(h);
                lista.appendChild(div);
            });

            lista.style.display = dados.length ? 'block' : 'none';
        } catch (err) {
            console.error(err);
        }
    });
}

function adicionarTagHabilidade(hab) {
    if (habilidadesSelecionadas.find(h => h.ID === hab.ID)) return;

    habilidadesSelecionadas.push(hab);
    renderizarTags();

    document.getElementById('buscaHabilidade').value = '';
    document.getElementById('resultadosBusca').style.display = 'none';
}

window.removerTagHabilidade = function (id) {
    habilidadesSelecionadas = habilidadesSelecionadas.filter(h => h.ID !== id);
    renderizarTags();
};

function renderizarTags() {
    const container = document.getElementById('habilidadesSelecionadas');
    if (!container) return;

    container.innerHTML = '';

    habilidadesSelecionadas.forEach(h => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerHTML = `${h.CODIGO} 
            <span class="remove-btn" onclick="removerTagHabilidade(${h.ID})">&times;</span>`;
        container.appendChild(span);
    });
}

// --- NAVEGAÇÃO ---

window.showSection = function (sectionId, btn) {

    document.querySelectorAll('.section-content').forEach(s => s.hidden = true);

    const target = document.getElementById(sectionId);
    if (target) target.hidden = false;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn && btn.classList.add('active');

    if (sectionId === 'section-curadoria') carregarSugestoes();
    if (sectionId === 'section-meus-envios') carregarMeusEnvios();
    if (sectionId === 'section-gerenciar-usuarios') carregarUsuariosAdmin();
};

// --- CADASTRO JOGO ---

async function cadastrarJogo(e) {
    e.preventDefault();

    const getChecked = (name) =>
        Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(cb => parseInt(cb.value));

    const jogo = {
        NOME: document.getElementById("NOME").value,
        LINK: document.getElementById("LINK").value,
        LINKIMAGEM: document.getElementById("LINKIMAGEM").value || 'default.png',
        IDIOMA: document.getElementById("IDIOMA").value,
        INTERACAO: document.getElementById("INTERACAO").value,
        LICENSA: document.getElementById("LICENSA").value,
        PLATAFORMAS: getChecked('PLATAFORMA'),
        GENEROS: getChecked('GENERO'),
        COMPONENTES: getChecked('COMPONENTE'),
        HABILIDADES: habilidadesSelecionadas.map(h => h.ID)
    };

    try {
        const res = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jogo)
        });

        if (!res.ok) throw new Error();

        if (window.idSugestaoEmFoco) {
            await fetch(`/api/games/suggest/${window.idSugestaoEmFoco}/approve`, { method: 'PUT' });
        }

        alert("Cadastro realizado!");
        location.reload();

    } catch {
        alert("Erro ao cadastrar jogo.");
    }
}

// --- PERFIL ---

async function atualizarDadosBasicos(e) {
    e.preventDefault();

    const payload = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value
    };

    try {
        const res = await fetch("/api/usuarios/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();

        setStatus("Atualizado!", "success");

    } catch {
        setStatus("Erro ao atualizar", "error");
    }
}

async function atualizarSenha(e) {
    e.preventDefault();

    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarNovaSenha").value;

    if (novaSenha !== confirmar) {
        setStatus("Senhas não coincidem", "error");
        return;
    }

    try {
        const res = await fetch("/api/usuarios/me/senha", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senhaAtual, novaSenha })
        });

        if (!res.ok) throw new Error();

        setStatus("Senha atualizada!", "success");
        e.target.reset();

    } catch {
        setStatus("Erro ao atualizar senha", "error");
    }
}

// --- SUGESTÕES ---

async function enviarSugestao(e) {
    e.preventDefault();

    const dados = {
        nome: document.getElementById("sug_nome").value,
        link: document.getElementById("sug_link").value,
        justificativa: document.getElementById("sug_justificativa").value
    };

    await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    alert("Enviado!");
    e.target.reset();
}

async function carregarSugestoes() {
    const tabela = document.getElementById("tabela-sugestoes");
    if (!tabela) return;

    try {
        const res = await fetch('/api/games/pending');
        const dados = await res.json();

        if (!dados.length) {
            tabela.innerHTML = `<tr><td colspan="3">Nenhuma sugestão</td></tr>`;
            return;
        }

        tabela.innerHTML = dados.map(s => `
            <tr>
                <td>${s.NOME_JOGO}</td>
                <td><a href="${s.LINK_ACESSO}" target="_blank">Abrir</a></td>
                <td>
                    <button class="btn btn-primary"
                        onclick="prepararAprovacao('${s.ID_SUGESTAO}','${s.NOME_JOGO}','${s.LINK_ACESSO}')">
                        Aprovar
                    </button>
                </td>
            </tr>
        `).join('');

    } catch {
        tabela.innerHTML = `<tr><td colspan="3">Erro ao carregar</td></tr>`;
    }
}

window.prepararAprovacao = function (id, nome, link) {
    showSection('section-cadastro-jogo', document.querySelector('[onclick*="cadastro-jogo"]'));
    document.getElementById("NOME").value = nome;
    document.getElementById("LINK").value = link;
    window.idSugestaoEmFoco = id;
};

// --- MEUS ENVIOS (NOVO) ---

async function carregarMeusEnvios() {
    const tabela = document.getElementById("tabela-meus-envios");
    if (!tabela) return;

    try {
        const res = await fetch('/api/suggest/mine');
        const dados = await res.json();

        if (!dados.length) {
            tabela.innerHTML = `<tr><td colspan="3">Nenhum envio</td></tr>`;
            return;
        }

        tabela.innerHTML = dados.map(s => `
            <tr>
                <td>${s.nome}</td>
                <td>${new Date(s.data_envio).toLocaleDateString()}</td>
                <td>${s.status}</td>
            </tr>
        `).join('');

    } catch {
        tabela.innerHTML = `<tr><td colspan="3">Erro</td></tr>`;
    }
}

// --- USUÁRIOS ---

async function carregarUsuariosAdmin() {
    const tabela = document.getElementById('tabela-usuarios-corpo');
    if (!tabela) return;

    const res = await fetch('/api/admin/users');
    const usuarios = await res.json();

    tabela.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.perfil}</td>
            <td>
                <button class="btn btn-primary"
                    onclick='abrirModalEditarUsuario(${JSON.stringify(u)})'>
                    Editar
                </button>
            </td>
        </tr>
    `).join('');
}

// --- MODAL ---

window.abrirModalEditarUsuario = function (user) {
    const modal = document.getElementById('modal-editar-usuario');
    modal.hidden = false;

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-nome').value = user.nome;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-perfil').value = user.perfil;
};

window.fecharModalUser = function () {
    document.getElementById('modal-editar-usuario').hidden = true;
};

// --- INIT ---

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    configurarBuscaHabilidades();

    document.getElementById("formDadosBasicos")?.addEventListener("submit", atualizarDadosBasicos);
    document.getElementById("formSenha")?.addEventListener("submit", atualizarSenha);
    document.getElementById("formCadastroJogo")?.addEventListener("submit", cadastrarJogo);
    document.getElementById("form-sugerir-jogo")?.addEventListener("submit", enviarSugestao);
});