const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'games.json');

function readGames() {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function saveGames(games) {
    fs.writeFileSync(filePath, JSON.stringify(games, null, 2));
}

module.exports = {
    readGames,
    saveGames
};
