const { readUsers, saveUsers } = require('../models/usersModel');

// Lista usuários (rota /users)
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

// Exibe página de perfil
exports.showProfile = (req, res) => {
    res.render('user', {
        usuario: req.session.usuario
    });
};

// Atualiza dados do perfil
exports.updateProfile = (req, res) => {
    const { email, perfil } = req.body;
    let usuarios = readUsers();

    const index = usuarios.findIndex(
        u => u.id === req.session.usuario.id
    );

    if (index === -1) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    usuarios[index].email = email ?? usuarios[index].email;
    usuarios[index].perfil = perfil ?? usuarios[index].perfil;

    saveUsers(usuarios);

    // Atualiza sessão
    req.session.usuario.email = usuarios[index].email;
    req.session.usuario.perfil = usuarios[index].perfil;

    res.json({ mensagem: 'Perfil atualizado com sucesso!' });
};

// Contato com desenvolvedor
exports.contactDeveloper = (req, res) => {
    console.log("Mensagem enviada ao dev:", req.body);
    res.json({ mensagem: "Mensagem enviada ao desenvolvedor!" });
};
