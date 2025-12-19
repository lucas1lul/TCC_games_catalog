const fs = require('fs');
const path = require('path');

// Ajuste o caminho para o seu arquivo de dados de usuários
const filePath = path.join(__dirname, 'usuarios.json');
console.log("Caminho de usuários sendo usado:", filePath);

function readUsers() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Retorna array vazio se o arquivo não existir ou for inválido
        console.error("Erro ao ler usuarios.json:", error.message);
        return [];
    }
}

function saveUsers(users) {
    try {
        // O terceiro argumento '2' formata o JSON com indentação para leitura humana
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error("Erro ao salvar usuarios.json:", error.message);
    }
}

module.exports = {
    readUsers,
    saveUsers
};