// Variáveis globais
let meusJogosOriginais = []; 
let jogosFiltrados = [];
let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    if (!usuarioSessao) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = 'index.html';
        return;
    }

    usuarioLogado = JSON.parse(usuarioSessao);

    document.getElementById('nomeDisplay').textContent = usuarioLogado.nome;
    document.getElementById('perfilDisplay').textContent = usuarioLogado.perfil;

    configurarInterfacePorPerfil(usuarioLogado.perfil.toLowerCase());
    carregarMeusDados();
});

// --- LÓGICA DE INTERFACE ---
function configurarInterfacePorPerfil(perfil) {
    const secaoAvaliacoes = document.getElementById('secaoAvaliacoes');
    const secaoProfessor = document.getElementById('secaoProfessor');

    if (['aluno', 'professor', 'administrador'].includes(perfil)) {
        if (secaoAvaliacoes) secaoAvaliacoes.style.display = 'block';
    }

    if (['professor', 'administrador'].includes(perfil)) {
        if (secaoProfessor) secaoProfessor.style.display = 'block';
    }
}

// Atualiza o contador de seleção para professores
function atualizarContador() {
    const selecionados = document.querySelectorAll('.check-jogo:checked').length;
    const contador = document.getElementById('contadorSelecao');
    if (contador) {
        contador.textContent = selecionados > 0 
            ? `${selecionados} jogo(s) selecionado(s)` 
            : 'Nenhum jogo selecionado';
    }
}

// --- LÓGICA DE FILTRO (Ajustada para os novos nomes do SQL) ---
function filtrarMeusJogos() {
    const curso = document.getElementById('filtroCurso')?.value.toLowerCase() || "";
    const componente = document.getElementById('filtroComponente')?.value.toLowerCase() || "";

    jogosFiltrados = meusJogosOriginais.filter(jogo => {
        // Ajustado para usar as colunas em maiúsculo do SQL (Ex: NOME, INTERACAO)
        const matchNome = jogo.NOME?.toLowerCase().includes(curso) || curso === "";
        const matchInteracao = jogo.INTERACAO?.toLowerCase().includes(componente) || componente === "";
        
        return matchNome && matchInteracao;
    });

    renderizarJogos(jogosFiltrados);
}

// --- RENDERIZAÇÃO (Ajustada para os novos nomes do SQL) ---
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

// Função para atualizar o texto de quantos jogos estão marcados
function atualizarContador() {
    const selecionados = document.querySelectorAll('.check-jogo:checked').length;
    const info = document.getElementById('contadorSelecao');
    if (info) {
        info.textContent = selecionados > 0 
            ? `${selecionados} jogo(s) selecionado(s)` 
            : 'Nenhum jogo selecionado';
    }
}

// --- COMUNICAÇÃO COM API ---
async function carregarMeusDados() {
    const container = document.getElementById('listaFavoritos');
    try {
        // 1. Busca favoritos (Ajuste o endpoint se necessário para seu novo backend SQL)
        const responseFav = await fetch(`/api/usuarios/${usuarioLogado.id}/favoritos`);
        const idsFavoritos = await responseFav.json();

        if (!idsFavoritos || idsFavoritos.length === 0) {
            container.innerHTML = '<p>Você ainda não favoritou nenhum jogo. ❤️</p>';
            return;
        }

        // 2. Busca jogos do Banco SQL (Endpoint que retorna SELECT * FROM JOGOS)
        const responseJogos = await fetch('/api/games');
        const todosJogos = await responseJogos.json();

        // 3. Filtra usando o novo IDJOGO (vindo do SQL)
        meusJogosOriginais = todosJogos.filter(jogo => idsFavoritos.includes(jogo.IDJOGO));
        jogosFiltrados = [...meusJogosOriginais];

        renderizarJogos(jogosFiltrados);

    } catch (error) {
        console.error("Erro ao carregar dados do SQL:", error);
        container.innerHTML = '<p>❌ Erro ao conectar ao banco de dados.</p>';
    }
}

// --- FUNÇÕES DE AÇÃO ---
function exportarLista() {
    const checkboxes = document.querySelectorAll('.check-jogo:checked');
    const idsSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (idsSelecionados.length === 0) {
        alert("Selecione ao menos um jogo para exportar.");
        return;
    }

    const dadosParaExportar = meusJogosOriginais.filter(j => idsSelecionados.includes(j.IDJOGO));

    // Gera o CSV formatado para Excel
    let csvContent = "\uFEFFID;Titulo;Link;Idioma\n";
    dadosParaExportar.forEach(j => {
        csvContent += `${j.IDJOGO};${j.NOME};${j.LINK};${j.IDIOMA}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "meus_jogos_selecionados.csv";
    link.click();
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

function exportarLista() {
    const checkboxes = document.querySelectorAll('.check-jogo:checked');
    const idsSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));

    if (idsSelecionados.length === 0) {
        alert("Por favor, selecione ao menos um jogo para exportar.");
        return;
    }

    // Filtra os dados completos apenas dos jogos selecionados
    const dadosParaExportar = meusJogosOriginais.filter(j => idsSelecionados.includes(j.id));

    // Cria o cabeçalho do CSV
    let csvContent = "ID;Titulo;Componente;URL\n";

    // Adiciona as linhas
    dadosParaExportar.forEach(j => {
        csvContent += `${j.id};${j.titulo};${j.componente};${j.url}\n`;
    });

    // Cria o download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "meus_jogos_selecionados.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}