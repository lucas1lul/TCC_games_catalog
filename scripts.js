// Dados dos Serious Games
const seriousGames = [
    { title: "AMARGANA", category: "Ensino Infantil", description: "Crianças (1 ano e 7...)", image: "./images/amargana.jpeg" },
    { title: "PIZZA AL-LANCIO", category: "Ensino Fundamental", description: "6º ano - Matemática", image: "https://via.placeholder.com/200x150" },
    { title: "KING OF MATH JR", category: "Ensino Fundamental", description: "Matemática", image: "https://via.placeholder.com/200x150" },
    { title: "MINERAÇÃO QUÍMICA", category: "Ensino Fundamental", description: "Química", image: "https://via.placeholder.com/200x150" },
    { title: "LUDOMIX", category: "Ensino Fundamental", description: "História", image: "https://via.placeholder.com/200x150" },
];

// Dados dos Jogos de Programação
const programmingGames = [
    { title: "CodeCombat", category: "Programação", description: "Aprenda Python e JavaScript jogando", image: "https://via.placeholder.com/200x150" },
    { title: "Screeps", category: "Programação", description: "MMO para programadores", image: "https://via.placeholder.com/200x150" },
    { title: "Human Resource Machine", category: "Programação", description: "Programação visual", image: "https://via.placeholder.com/200x150" },
    { title: "TIS-100", category: "Programação", description: "Programação em assembly", image: "https://via.placeholder.com/200x150" },
];

// Função para renderizar os jogos
function renderGames(games, containerId) {
    const gamesContainer = document.getElementById(containerId);
    gamesContainer.innerHTML = ''; // Limpa o container antes de renderizar

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        gameCard.innerHTML = `
            <img src="${game.image}" alt="${game.title}">
            <h3>${game.title}</h3>
            <p>${game.category}</p>
            <p>${game.description}</p>
        `;

        gamesContainer.appendChild(gameCard);
    });
}

// Função para filtrar jogos
function filterGames() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredGames = seriousGames.filter(game => 
        game.title.toLowerCase().includes(searchInput) || 
        game.category.toLowerCase().includes(searchInput)
    );
    renderGames(filteredGames, 'gamesContainer');
}

// Função para alternar entre abas
function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');

    tabContents.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');

    if (tabName === 'serious-games') {
        renderGames(seriousGames, 'gamesContainer');
    } else if (tabName === 'programacao') {
        renderGames(programmingGames, 'programmingGamesContainer');
    }
}

// Renderiza os jogos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderGames(seriousGames, 'gamesContainer');
});