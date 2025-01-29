// Dados dos jogos (pode ser substituído por uma API)
const games = [
    { title: "The Witcher 3", category: "RPG", image: "https://via.placeholder.com/200x150" },
    { title: "Cyberpunk 2077", category: "RPG", image: "https://via.placeholder.com/200x150" },
    { title: "FIFA 23", category: "Esporte", image: "https://via.placeholder.com/200x150" },
    { title: "Call of Duty: Modern Warfare", category: "FPS", image: "https://via.placeholder.com/200x150" },
    { title: "Assassin's Creed Valhalla", category: "Ação", image: "https://via.placeholder.com/200x150" },
    { title: "Minecraft", category: "Sandbox", image: "https://via.placeholder.com/200x150" },
    { title: "Fortnite", category: "Battle Royale", image: "https://via.placeholder.com/200x150" },
    { title: "League of Legends", category: "MOBA", image: "https://via.placeholder.com/200x150" },
];

// Função para renderizar os jogos
function renderGames(filteredGames = games) {
    const gamesContainer = document.getElementById('gamesContainer');
    gamesContainer.innerHTML = ''; // Limpa o container antes de renderizar

    filteredGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        gameCard.innerHTML = `
            <img src="${game.image}" alt="${game.title}">
            <h3>${game.title}</h3>
            <p>${game.category}</p>
        `;

        gamesContainer.appendChild(gameCard);
    });
}

// Função para filtrar jogos
function filterGames() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchInput) || 
        game.category.toLowerCase().includes(searchInput)
    );
    renderGames(filteredGames);
}

// Renderiza os jogos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderGames();
});