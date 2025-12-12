// models/gamesModel.js

const fs = require('fs');
const path = require('path');

// Ajuste este caminho se games.json não estiver na mesma pasta que gamesModel.js
const filePath = path.join(__dirname, 'games.json'); 

function readGames() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existir (ENOENT) ou for inválido (JSON.parse), 
        // retorna um array vazio para que o servidor possa iniciar ou cadastrar
        if (error.code === 'ENOENT') {
            console.log("Arquivo games.json não encontrado. Criando lista vazia.");
            return [];
        }
        console.error("Erro ao ler games.json:", error.message);
        // Se for outro erro grave (permissão, etc.), ainda retornamos [] para tentar salvar
        return []; 
    }
}

function saveGames(games) {
    // ... (Mantenha a função saveGames original)
    try {
        fs.writeFileSync(filePath, JSON.stringify(games, null, 2), 'utf8');
    } catch (error) {
        console.error("Erro CRÍTICO ao salvar games.json:", error.message);
    }
}

module.exports = {
    readGames,
    saveGames
};