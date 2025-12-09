// Remova a linha "carregarJogos();" do final do arquivo.

async function carregarJogos() {
    // A função carregarJogos agora só será chamada pelo botão "Filtrar"
    // e não será executada no carregamento inicial da página.
    const curso = document.getElementById("filtroCurso").value;
    const componente = document.getElementById("filtroComponente").value;
    const habilidade = document.getElementById("filtroHabilidade").value;
    const plataforma = document.getElementById("filtroPlataforma").value;

    // Adiciona uma pequena validação/mensagem antes de buscar
    const lista = document.getElementById("lista");
    
    // Verifica se pelo menos um filtro foi preenchido. 
    // Se nenhum filtro for preenchido, você pode optar por:
    // a) Mostrar todos os jogos (comportamento atual, mas o usuário não esperaria)
    // b) Exibir uma mensagem pedindo para preencher um filtro (melhor UX)
    
    if (!curso && !componente && !habilidade && !plataforma) {
        lista.innerHTML = "💡 Preencha pelo menos um campo de filtro para buscar os jogos.";
        return; // Sai da função
    }

    // Exibe uma mensagem de carregamento durante a busca
    lista.innerHTML = "Carregando resultados...";

    let url = "/api/games?";
    if (curso) url += `curso=${curso}&`;
    if (componente) url += `componente=${componente}&`;
    if (habilidade) url += `habilidade=${habilidade}&`;
    if (plataforma) url += `plataforma=${plataforma}&`;

    // Remove o & final, se existir
    if (url.endsWith('&')) {
        url = url.slice(0, -1);
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Erro HTTP! Status: ${res.status}`);
        }
        const jogos = await res.json();
        
        lista.innerHTML = ""; // Limpa a mensagem de carregamento

        if (jogos.length === 0) {
            lista.innerHTML = "⚠️ Nenhum jogo encontrado com os filtros selecionados.";
            return;
        }

        jogos.forEach(jogo => {
            lista.innerHTML += `
                <div class="card">
                    <h2>${jogo.nome}</h2>
                    <p>${jogo.descricao}</p>
                    <button onclick="verDetalhes(${jogo.id})">Ver mais</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao buscar jogos:", error);
        lista.innerHTML = "❌ Ocorreu um erro ao carregar os dados. Tente novamente.";
    }
}

function verDetalhes(id) {
    window.location.href = "detalhes.html?id=" + id;
}

// **A chamada carregarJogos(); foi removida daqui.**