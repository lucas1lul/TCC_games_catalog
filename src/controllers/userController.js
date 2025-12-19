const { readUsers } = require('../models/usersModel');

exports.listUsers = (req, res) => {
    const usuarios = readUsers();
    const usersWithoutPassword = usuarios.map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil
    }));
    res.status(200).json(usersWithoutPassword);
};

exports.contactDeveloper = (req, res) => {
    console.log("Mensagem enviada ao dev:", req.body);
    res.json({ mensagem: "Mensagem enviada ao desenvolvedor!" });
};