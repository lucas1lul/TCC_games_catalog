const fs = require('fs');
const path = require('path');

// Caminho para o seu "banco de dados" temporário em JSON
const filePath = path.join(__dirname, '../models/users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler arquivo de usuários:", error);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Erro ao salvar arquivo de usuários:", error);
  }
}

exports.findAll = () => {
  return readUsers();
};

exports.findById = (id) => {
  const users = readUsers();
  // Garantimos que a comparação seja feita com números
  return users.find(user => Number(user.id) === Number(id));
};

exports.findByEmail = (email) => {
  const users = readUsers();
  return users.find(user => user.email === email);
};

exports.createUser = (userData) => {
  const users = readUsers();

  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    ...userData,
    favoritos: userData.favoritos || []
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
};

exports.update = (id, updatedData) => {
  const users = readUsers();
  const index = users.findIndex(user => Number(user.id) === Number(id));

  if (index === -1) return null;

  // Mescla os dados antigos com os novos
  users[index] = { ...users[index], ...updatedData };
  saveUsers(users);

  return users[index];
};