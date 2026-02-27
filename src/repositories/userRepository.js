const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../data/users.json');

function readUsers() {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

exports.findAll = () => {
  return readUsers();
};

exports.findById = (id) => {
  const users = readUsers();
  return users.find(user => user.id === Number(id));
};

exports.findByEmail = (email) => {
  const users = readUsers();
  return users.find(user => user.email === email);
};

exports.create = (userData) => {
  const users = readUsers();

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    ...userData,
    favoritos: []
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
};

exports.update = (id, updatedData) => {
  const users = readUsers();
  const index = users.findIndex(user => user.id === Number(id));

  if (index === -1) return null;

  users[index] = { ...users[index], ...updatedData };
  saveUsers(users);

  return users[index];
};