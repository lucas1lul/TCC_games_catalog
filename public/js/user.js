let usuarioLogado = null;

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

// --- SESSÃO E INICIALIZAÇÃO ---

async function verificarSessao() {
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user; 
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

    // Preenche perfil
    if(document.getElementById("nome")) document.getElementById("nome").value = usuarioLogado.nome || "";
    if(document.getElementById("email")) document.getElementById("email").value = usuarioLogado.email || "";

    // Controle de Menu por Perfil
    if (usuarioLogado.perfil === 'administrador') {
        document.getElementById("menu-admin").style.display = "block";
    } else if (usuarioLogado.perfil === 'profissional_ti') {
        document.getElementById("menu-ti").style.display = "block";
    }
}

// --- NAVEGAÇÃO ---

function showSection(sectionId, btn) {
    document.querySelectorAll('.section-content').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Carregamento sob demanda
    if (sectionId === 'section-curadoria') carregarSugestoes();
    if (sectionId === 'section-meus-envios') carregarMeusEnvios();
}

// --- AÇÕES DO PROFISSIONAL DE TI (SUGESTÕES) ---

async function enviarSugestao(e) {
    e.preventDefault(); // Impede a página de recarregar
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const msgDiv = document.getElementById("msg-confirmacao-sugestao");
    
    if (btnSubmit) btnSubmit.disabled = true; // Bloqueia duplo clique

    const dados = {
        nome: document.getElementById("sug_nome").value,
        link: document.getElementById("sug_link").value,
        justificativa: document.getElementById("sug_justificativa").value
    };

    try {
        // ATENÇÃO AQUI: Verifique se a rota começa com /api/games/suggest ou apenas /api/suggest
        const res = await fetch('/api/suggest', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const result = await res.json();

        if (res.ok) {
            // MOSTRA A MENSAGEM DE CONFIRMAÇÃO VISUAL
            if (msgDiv) {
                msgDiv.style.display = "block";
                msgDiv.style.backgroundColor = "#d4edda"; // Fundo verde claro
                msgDiv.style.color = "#155724"; // Texto verde escuro
                msgDiv.style.border = "1px solid #c3e6cb";
                msgDiv.textContent = "✅ " + result.message;
                
                // Esconde a mensagem depois de 4 segundos
                setTimeout(() => {
                    msgDiv.style.display = "none";
                }, 4000);
            }
            
            e.target.reset(); // Limpa os campos do formulário
        } else {
            // MENSAGEM DE ERRO VISUAL
            if (msgDiv) {
                msgDiv.style.display = "block";
                msgDiv.style.backgroundColor = "#f8d7da"; // Fundo vermelho claro
                msgDiv.style.color = "#721c24";
                msgDiv.style.border = "1px solid #f5c6cb";
                msgDiv.textContent = "❌ Erro: " + (result.error || "Falha ao enviar");
            }
        }
    } catch (err) {
        console.error("Erro no envio do fetch:", err);
        alert("Erro de conexão com o servidor. Abra o console (F12) para ver os detalhes.");
    } finally {
        if (btnSubmit) btnSubmit.disabled = false; // Libera o botão novamente
    }
}

async function carregarSugestoes() {
    const tabela = document.getElementById("tabela-sugestoes");
    if (!tabela) return;

    try {
        const res = await fetch('/api/games/pending'); // Verifica se sua URL base é /api mesmo
        
        // Proteção: Se o backend retornar 404 ou 500, a gente barra aqui.
        if (!res.ok) {
            throw new Error(`Erro na rota: Status ${res.status}`);
        }

        const sugestoes = await res.json();
        
        // Verifica se realmente é um Array antes de usar o .map
        if (!Array.isArray(sugestoes) || sugestoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma sugestão pendente.</td></tr>';
            return;
        }

        tabela.innerHTML = sugestoes.map(s => `
            <tr>
                <td>${s.NOME_JOGO}</td>
                <td>${s.AUTOR_ID || 'Usuário'}</td>
                <td><a href="${s.LINK_ACESSO}" target="_blank">Link</a></td>
                <td>
                    <button class="btn-approve" onclick="prepararAprovacao('${s.ID_SUGESTAO}', '${s.NOME_JOGO}', '${s.LINK_ACESSO}')">✅</button>
                    <button class="btn-reject" onclick="rejeitarSugestao('${s.ID_SUGESTAO}')">❌</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar sugestões:", err);
        tabela.innerHTML = '<tr><td colspan="4" style="color:red;">Erro ao carregar os dados.</td></tr>';
    }
}

async function carregarMeusEnvios() {
    const tabelaCorpo = document.getElementById("tabela-meus-envios");
    
    if (!tabelaCorpo) {
        console.error("❌ Erro: Não encontrei 'tabela-meus-envios' no HTML.");
        return;
    }

    try {
        const res = await fetch('/api/my-suggestions');
        
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

        const envios = await res.json();

        if (!Array.isArray(envios) || envios.length === 0) {
            tabelaCorpo.innerHTML = '<tr><td colspan="3">Você ainda não enviou sugestões.</td></tr>';
            return;
        }

        // Preenchendo as 3 colunas: Jogo, Data e Status
        tabelaCorpo.innerHTML = envios.map(s => {
            const dataFormatada = s.DATA_ENVIO ? new Date(s.DATA_ENVIO).toLocaleDateString() : '---';
            const statusLabel = (s.STATUS || 'pendente').toUpperCase();

            return `
                <tr>
                    <td><strong>${s.NOME_JOGO || 'Sem nome'}</strong></td>
                    <td>${dataFormatada}</td>
                    <td><span class="status-badge status-${(s.STATUS || 'pendente').toLowerCase()}">${statusLabel}</span></td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("Erro ao carregar envios:", err);
        tabelaCorpo.innerHTML = '<tr><td colspan="3" style="color:red;">Erro ao carregar dados.</td></tr>';
    }
}

function prepararAprovacao(id, nome, link) {
    showSection('section-cadastro-jogo', document.querySelector('[onclick*="section-cadastro-jogo"]'));
    document.getElementById("nome_jogo").value = nome;
    document.getElementById("link_acesso").value = link;
    window.idSugestaoEmFoco = id; // Guarda para atualizar status após salvar
    alert("Dados carregados. Complete as informações técnicas.");
}

async function rejeitarSugestao(id) {
    if (!confirm("Rejeitar esta sugestão?")) return;
    try {
        const res = await fetch(`/api/games/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'rejeitado' })
        });
        if (res.ok) carregarSugestoes();
    } catch (err) {
        alert("Erro ao rejeitar.");
    }
}

async function cadastrarJogo(e) {
    e.preventDefault();
    const jogo = {
        nome: document.getElementById("nome_jogo").value,
        link: document.getElementById("link_acesso").value,
        linkimagem: document.getElementById("linkimagem").value || 'placeholder.png',
        idioma: document.getElementById("idioma").value,
        interacao: document.getElementById("interacao").value,
        licensa: document.getElementById("licensa").value
    };

    try {
        const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jogo)
        });

        if (response.ok) {
            // Se veio de uma sugestão, aprova ela automaticamente agora que o jogo oficial foi criado
            if (window.idSugestaoEmFoco) {
                await fetch(`/api/games/${window.idSugestaoEmFoco}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'aprovado' })
                });
            }
            alert("Jogo cadastrado oficialmente!");
            location.reload();
        }
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
    }
}

// --- AÇÕES DO PERFIL ---

async function salvarAlteracoes(e) {
    e.preventDefault();
    
    // Verifica se os elementos existem antes de pegar o valor para evitar novos erros
    const elNome = document.getElementById("nome");
    const elEmail = document.getElementById("email");
    
    if (!elNome || !elEmail) return;

    const nome = elNome.value.trim();
    const email = elEmail.value.trim();
    const senhaAtual = document.getElementById("senhaAtual")?.value || "";
    const novaSenha = document.getElementById("novaSenha")?.value || "";
    const confirmar = document.getElementById("confirmarNovaSenha")?.value || "";

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
            if (document.getElementById("senhaAtual")) {
                document.getElementById("senhaAtual").value = "";
                document.getElementById("novaSenha").value = "";
                document.getElementById("confirmarNovaSenha").value = "";
            }
        } else {
            const err = await res.json();
            throw new Error(err.message || "Erro ao atualizar");
        }
    } catch (err) {
        setStatus(err.message, "error");
    }
}

/// --- EVENT LISTENERS ---

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosIniciais();
    
    // Form de Perfil
    const formConta = document.getElementById("formConta");
    if (formConta) formConta.addEventListener("submit", salvarAlteracoes);

    // Form de Cadastro (Admin)
    const formJogo = document.getElementById("formCadastroJogo");
    if (formJogo) formJogo.addEventListener("submit", cadastrarJogo);

    // Form de Sugestão (Profissional TI)
    const formSugestao = document.getElementById("form-sugerir-jogo");
    
    // RADAR DE ERRO:
    if (formSugestao) {
        console.log("✅ Formulário de sugestão encontrado no HTML!");
        formSugestao.addEventListener("submit", enviarSugestao);
    } else {
        console.error("❌ ERRO: O JavaScript não achou nenhum <form> com o id='form-sugerir-jogo'. Verifique seu HTML.");
    }
});