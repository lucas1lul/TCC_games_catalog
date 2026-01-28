// catalogo.js
document.addEventListener('DOMContentLoaded', () => {
    const usuarioSessao = localStorage.getItem('usuarioLogado');
    
    if (usuarioSessao) {
        const usuario = JSON.parse(usuarioSessao);
        const header = document.querySelector('h1'); 
        const saudacao = document.createElement('p');
        saudacao.style.fontSize = '1rem';
        saudacao.style.color = '#555';
        header.insertAdjacentElement('afterend', saudacao);
    }
});

let jogosCompletos = []; 
let paginaAtual = 1;
const jogosPorPagina = 9; 

async function carregarJogos() {
    const nome = document.getElementById("filtroNome").value.trim(); // .trim() remove espaços vazios extras
    const curso = document.getElementById("filtroCurso").value;
    const componente = document.getElementById("filtroComponente").value;
    const habilidade = document.getElementById("filtroHabilidade").value;
    const plataforma = document.getElementById("filtroPlataforma").value;
    
    const lista = document.getElementById("lista"); 
    
    paginaAtual = 1;
    jogosCompletos = [];
    lista.innerHTML = ""; 

    // Adicionado o 'nome' na validação de preenchimento
    if (!nome && !curso && !componente && !habilidade && !plataforma) {
        lista.innerHTML = "💡 Preencha pelo menos um campo de filtro para buscar os jogos.";
        atualizarControlesPaginacao(); 
        return; 
    }

    lista.innerHTML = "Carregando resultados...";

    // Montando a URL para a API (SQL usa JOGO_NOME no backend)
    let url = "/api/games?"; 
    if (nome) url += `nome=${encodeURIComponent(nome)}&`;
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
        console.error("Erro ao buscar jogos no SQL:", error);
        lista.innerHTML = `❌ Erro ao carregar dados do banco SQL.`;
        atualizarControlesPaginacao();
    }
}

function renderizarJogosDaPagina() {
    const lista = document.getElementById("lista"); 
    lista.innerHTML = ""; 

    const inicio = (paginaAtual - 1) * jogosPorPagina;
    const fim = inicio + jogosPorPagina;
    const jogosDaPagina = jogosCompletos.slice(inicio, fim);

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const favoritos = usuarioLogado?.favoritos || [];

    jogosDaPagina.forEach(jogo => {
        const classeAtiva = favoritos.includes(jogo.IDJOGO) ? 'ativa' : '';
        
        // Lógica da Imagem: Se não houver LINKIMAGEM, usa um placeholder
        const urlImg = jogo.LINKIMAGEM ? `/images/${jogo.LINKIMAGEM}` : '/images/placeholder.png';

        // NOVO CARD MODERNO COM IMAGEM E ESTILO LIMPO
        lista.innerHTML += `
    <div class="jogo-card">
        <div class="card-image-container">
            <img src="/images/${jogo.LINKIMAGEM || 'placeholder.png'}" alt="${jogo.NOME}" class="jogo-img">
            <span class="estrela-favorito ${classeAtiva}" onclick="toggleFavorito(${jogo.IDJOGO}, this)">★</span>
        </div>

        <div class="card-content">
            <div class="card-header-info">
                <h2 class="jogo-titulo">${jogo.NOME}</h2>
                <span class="jogo-componente">${jogo.INTERACAO || 'N/A'}</span>
            </div>
            
            <div class="card-body">
                <p class="jogo-descricao">${jogo.DESCRICAOIMAGEM || 'Sem descrição.'}</p>
            </div>

            <div class="card-footer" style="display: flex; gap: 10px;">
                <button onclick='abrirDetalhes(${JSON.stringify(jogo).replace(/'/g, "&apos;")})' class="btn-ver-mais">
                    🔍 Detalhes
                </button>
                
                <a href="${jogo.LINK || '#'}" target="_blank" class="btn-acessar" style="flex: 1;">
                    Jogar
                </a>
            </div>
        </div>
    </div>
`;
    });

    atualizarControlesPaginacao();
}

// ... (Mantenha as funções mudarPagina e atualizarControlesPaginacao iguais) ...

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
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');
    const infoPagina = document.getElementById('infoPagina');

    if (btnAnterior) btnAnterior.disabled = paginaAtual === 1;
    if (btnProximo) btnProximo.disabled = paginaAtual === totalPaginas || jogosCompletos.length === 0;
    if (infoPagina) infoPagina.textContent = `Página ${totalPaginas === 0 ? 0 : paginaAtual} de ${totalPaginas}`;
}

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
            // Atualiza o localStorage com o novo IDJOGO vindo do SQL
            usuarioLogado.favoritos = data.favoritos;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        }
    } catch (error) {
        console.error("Erro ao favoritar no banco SQL:", error);
    }

    let timeout = null;
document.getElementById('filtroNome').addEventListener('keyup', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        carregarJogos();
    }, 500); 
});
}
function abrirDetalhes(jogo) {
    document.getElementById('modalTitulo').innerText = jogo.NOME || "Sem nome";
    document.getElementById('modalImg').src = `/images/${jogo.LINKIMAGEM || 'placeholder.png'}`;
    
    // Mapeamento baseado no print do seu banco
    document.getElementById('modalHabilidades').innerText = jogo.HABILIDADES || 'Não informado';
    document.getElementById('modalGenero').innerText = jogo.GENERO_DESCRICAO || 'Não informado';
    document.getElementById('modalIdioma').innerText = jogo.IDIOMA || 'Não informado';
    document.getElementById('modalPlataforma').innerText = jogo.PLATAFORMA_DESCRICAO || 'Não informado';
    document.getElementById('modalLicenca').innerText = jogo.LICENSA || 'Não informado';
    document.getElementById('modalInteracao').innerText = jogo.INTERACAO || 'Não informado';

    document.getElementById('modalDetalhes').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalDetalhes').style.display = 'none';
}

// Fechar se clicar fora do modal
window.onclick = function(event) {
    let modal = document.getElementById('modalDetalhes');
    if (event.target == modal) fecharModal();
}
