// catalogo.js
document.addEventListener('DOMContentLoaded', () => {
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    if (usuarioSessao) {
        const usuario = JSON.parse(usuarioSessao);
        const header = document.querySelector('h1'); 
        const saudacao = document.createElement('p');
        saudacao.innerHTML = `Olá, <strong>${usuario.nome}</strong>! Você está logado como ${usuario.perfil}.`;
        saudacao.style.fontSize = '1rem';
        saudacao.style.color = '#555';
        header.insertAdjacentElement('afterend', saudacao);
    }
});

let jogosCompletos = []; 
let paginaAtual = 1;
const jogosPorPagina = 9; 

async function carregarJogos() {
    const curso = document.getElementById("filtroCurso").value;
    const componente = document.getElementById("filtroComponente").value;
    const habilidade = document.getElementById("filtroHabilidade").value;
    const plataforma = document.getElementById("filtroPlataforma").value;
    
    const lista = document.getElementById("lista"); 
    
    paginaAtual = 1;
    jogosCompletos = [];
    lista.innerHTML = ""; 

    if (!curso && !componente && !habilidade && !plataforma) {
        lista.innerHTML = "💡 Preencha pelo menos um campo de filtro para buscar os jogos.";
        atualizarControlesPaginacao(); 
        return; 
    }

    lista.innerHTML = "Carregando resultados...";

    let url = "/api/games?"; 
    if (curso) url += `curso=${encodeURIComponent(curso)}&`;
    if (componente) url += `componente=${encodeURIComponent(componente)}&`;
    if (habilidade) url += `habilidade=${encodeURIComponent(habilidade)}&`;
    if (plataforma) url += `plataforma=${encodeURIComponent(plataforma)}&`;

    if (url.endsWith('&')) url = url.slice(0, -1);
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro HTTP! Status: ${res.status}`);
        
        jogosCompletos = await res.json();
        
        if (jogosCompletos.length === 0) {
            lista.innerHTML = "⚠️ Nenhum jogo encontrado com os filtros selecionados.";
            atualizarControlesPaginacao(); 
            return;
        }

        renderizarJogosDaPagina();
        
    } catch (error) {
        console.error("Erro ao buscar jogos:", error);
        lista.innerHTML = `❌ Erro ao carregar dados: ${error.message}`;
        atualizarControlesPaginacao();
    }
}

function renderizarJogosDaPagina() {
    const lista = document.getElementById("lista"); 
    lista.innerHTML = ""; 

    const inicio = (paginaAtual - 1) * jogosPorPagina;
    const fim = inicio + jogosPorPagina;
    const jogosDaPagina = jogosCompletos.slice(inicio, fim);

    // Pegamos os favoritos do usuário logado para marcar as estrelas
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const favoritos = usuarioLogado?.favoritos || [];

    jogosDaPagina.forEach(jogo => {
        const generos = (Array.isArray(jogo.generos) && jogo.generos.length > 0) ? jogo.generos.join(' | ') : 'N/A';
        const habilidades = (Array.isArray(jogo.habilidades) && jogo.habilidades.length > 0) ? jogo.habilidades.join(', ') : 'N/A';
        const plataforma = (Array.isArray(jogo.plataforma) && jogo.plataforma.length > 0) ? jogo.plataforma.join(', ') : 'N/A';
        
        // Verifica se este jogo está nos favoritos para aplicar a classe CSS 'ativa'
        const classeAtiva = favoritos.includes(jogo.id) ? 'ativa' : '';

        lista.innerHTML += `
            <div class="jogo-card">
                <div class="card-header" style="position: relative;">
                    <h2 class="jogo-titulo">${jogo.titulo}</h2>
                    <span class="jogo-componente">COMPONENTES: ${jogo.componente || 'N/A'}</span>
                    <span class="estrela-favorito ${classeAtiva}" onclick="toggleFavorito(${jogo.id}, this)">★</span>
                </div>
                
                <div class="card-body">
                    <p class="jogo-descricao">${jogo.descricao}</p>
                    <div class="detalhes-grid">
                        <p class="detalhe-item"><strong>Plataformas:</strong> ${plataforma}</p>
                        <p class="detalhe-item"><strong>Gêneros:</strong> ${generos}</p>
                        <p class="detalhe-item"><strong>Habilidades:</strong> ${habilidades}</p>
                        <p class="detalhe-item"><strong>Ano:</strong> ${jogo.ano_lancamento || 'N/A'}</p>
                        <p class="detalhe-item"><strong>Idioma:</strong> ${jogo.idioma || 'N/A'}</p>
                    </div>
                </div>

                <div class="card-footer">
                    <a href="${jogo.url || '#'}" target="_blank" rel="noopener noreferrer">${jogo.url ? 'Acessar Jogo' : 'Link Indisponível'}</a>
                </div>
            </div>
        `;
    });

    atualizarControlesPaginacao();
}

// Funções de Favorito, Paginação e Navegação (Mantidas conforme sua lógica)
async function toggleFavorito(jogoId, elementoEstrela) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado) {
        alert("Você precisa estar logado para favoritar!");
        return;
    }

    try {
        const response = await fetch('/api/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuarioId: usuarioLogado.id, 
                jogoId: jogoId 
            })
        });

        const data = await response.json();

        if (response.ok) {
            elementoEstrela.classList.toggle('ativa');
            usuarioLogado.favoritos = data.favoritos;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        }
    } catch (error) {
        console.error("Erro ao favoritar:", error);
    }
}

function mudarPagina(direcao) {
    const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
    const novaPagina = paginaAtual + direcao;
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        paginaAtual = novaPagina;
        renderizarJogosDaPagina();
        document.getElementById("lista").scrollIntoView({ behavior: 'smooth' }); 
    }
}

function atualizarControlesPaginacao() {
    const totalPaginas = Math.ceil(jogosCompletos.length / jogosPorPagina);
    document.getElementById('btnAnterior').disabled = paginaAtual === 1;
    document.getElementById('btnProximo').disabled = paginaAtual === totalPaginas || jogosCompletos.length === 0;
    document.getElementById('infoPagina').textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
}