// Variáveis globais para armazenar os dados e permitir filtragem sem nova requisição ao servidor
let meusJogosOriginais = []; 
let jogosFiltrados = [];
let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se o usuário está logado
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    if (!usuarioSessao) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = 'index.html';
        return;
    }

    usuarioLogado = JSON.parse(usuarioSessao);

    // 2. Atualiza cabeçalho com dados do usuário
    document.getElementById('nomeDisplay').textContent = usuarioLogado.nome;
    document.getElementById('perfilDisplay').textContent = usuarioLogado.perfil;

    // 3. Configura a interface baseada no Perfil
    configurarInterfacePorPerfil(usuarioLogado.perfil.toLowerCase());

    // 4. Carrega os dados iniciais (Favoritos/Avaliações)
    carregarMeusDados();
});

// --- LÓGICA DE INTERFACE ---

function configurarInterfacePorPerfil(perfil) {
    const secaoAvaliacoes = document.getElementById('secaoAvaliacoes');
    const secaoProfessor = document.getElementById('secaoProfessor');

    // Regra: Alunos, Professores e Admins vêem avaliações
    if (['aluno', 'professor', 'administrador'].includes(perfil)) {
        if (secaoAvaliacoes) secaoAvaliacoes.style.display = 'block';
    }

    // Regra: Professor e Admin vêem ferramentas de docente/exportação
    if (['professor', 'administrador'].includes(perfil)) {
        if (secaoProfessor) secaoProfessor.style.display = 'block';
    }
}

// --- LÓGICA DE FILTRO (IGUAL AO CATALOGO.HTML) ---

function filtrarMeusJogos() {
    const curso = document.getElementById('filtroCurso')?.value.toLowerCase() || "";
    const componente = document.getElementById('filtroComponente')?.value.toLowerCase() || "";
    const habilidade = document.getElementById('filtroHabilidade')?.value.toLowerCase() || "";
    const plataforma = document.getElementById('filtroPlataforma')?.value.toLowerCase() || "";

    jogosFiltrados = meusJogosOriginais.filter(jogo => {
        const matchCurso = jogo.curso?.toLowerCase().includes(curso) || curso === "";
        const matchComponente = jogo.componente?.toLowerCase().includes(componente) || componente === "";
        
        // Verifica se alguma habilidade do array contém o texto
        const matchHabilidade = jogo.habilidades?.some(h => h.toLowerCase().includes(habilidade)) || habilidade === "";
        
        // Verifica se alguma plataforma do array contém o texto
        const matchPlataforma = jogo.plataforma?.some(p => p.toLowerCase().includes(plataforma)) || plataforma === "";

        return matchCurso && matchComponente && matchHabilidade && matchPlataforma;
    });

    renderizarJogos(jogosFiltrados);
}

// --- RENDERIZAÇÃO ---

function renderizarJogos(lista) {
    const container = document.getElementById('listaFavoritos');
    if (!container) return;

    container.innerHTML = ''; // Limpa o "Carregando..."

    lista.forEach(jogo => {
        const card = document.createElement('div');
        card.className = 'card-jogo';
        
        // Mantém suas lógicas de checkbox e botões de admin aqui...
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${jogo.titulo}</h3>
            </div>
            <div class="card-body">
                <p><strong>Componente:</strong> ${jogo.componente || 'N/A'}</p>
                <p>${jogo.descricao ? jogo.descricao.substring(0, 80) + '...' : ''}</p>
            </div>
            <div class="card-footer">
                <a href="/detalhes.html?id=${jogo.id}" class="btn-link">Ver Detalhes</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- COMUNICAÇÃO COM API ---

async function carregarMeusDados() {
    const container = document.getElementById('listaFavoritos');
    try {
        // 1. Busca os IDs dos favoritos do usuário logado via API
        const responseFav = await fetch(`/api/usuarios/${usuarioLogado.id}/favoritos`);
        const idsFavoritos = await responseFav.json();

        if (!idsFavoritos || idsFavoritos.length === 0) {
            container.innerHTML = '<p>Você ainda não favoritou nenhum jogo. Vá ao catálogo e clique na estrela! ❤️</p>';
            return;
        }

        // 2. Busca a lista completa de jogos para cruzar os dados
        const responseJogos = await fetch('/api/games');
        const todosJogos = await responseJogos.json();

        // 3. Filtra apenas os jogos cujos IDs estão na lista de favoritos
        meusJogosOriginais = todosJogos.filter(jogo => idsFavoritos.includes(jogo.id));
        jogosFiltrados = [...meusJogosOriginais];

        // 4. Renderiza na tela
        renderizarJogos(jogosFiltrados);

    } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
        container.innerHTML = '<p>❌ Erro ao carregar seus dados. Tente novamente mais tarde.</p>';
    }
}

// --- FUNÇÕES DE AÇÃO ---

function exportarLista() {
    const selecionados = Array.from(document.querySelectorAll('.check-jogo:checked'))
                              .map(cb => cb.dataset.id);
    
    if (selecionados.length === 0) {
        alert("Selecione ao menos um jogo para exportar.");
        return;
    }
    alert("Exportando lista dos IDs: " + selecionados.join(', '));
    // Aqui entrará a lógica de gerar o CSV
}

function sugerirJogo() {
    // Redireciona para um formulário de sugestão ou abre modal
    alert("Funcionalidade de Sugestão será implementada em breve!");
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}