const bcrypt = require('bcrypt');
const { readUsers, saveUsers } = require('../models/usersModel');

// Renderiza página de login
exports.loginPage = (req, res) => {
    res.render('login'); // ou res.sendFile se estiver usando HTML puro
};

// Processa login
exports.loginAuth = async (req, res) => {
    const { email, senha } = req.body;
    const usuarios = readUsers();

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
    }

    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
    }

    res.status(200).json({
        mensagem: 'Login bem-sucedido!',
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }
    });
};

// Renderiza página de registro
exports.registerPage = (req, res) => {
    res.render('register'); // ou res.sendFile
};

// Processa registro
exports.registerAuth = async (req, res) => {
    const { nome, email, senha, perfil } = req.body;
    const usuarios = readUsers();

    const perfisValidos = ['aluno', 'professor', 'administrador', 'profissional_ti'];
    if (!perfil || !perfisValidos.includes(perfil)) {
        return res.status(400).json({ mensagem: 'Perfil inválido ou ausente.' });
    }

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
        return res.status(409).json({ mensagem: 'Email já registrado!' });
    }

    const hash = await bcrypt.hash(senha, 10);
    const proximoId =
        usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

    const novoUsuario = {
        id: proximoId,
        nome,
        email,
        senha: hash,
        perfil
    };

    usuarios.push(novoUsuario);
    saveUsers(usuarios);

    res.status(201).json({
        mensagem: 'Usuário registrado!',
        usuario: {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            perfil: novoUsuario.perfil
        }
    });
};

// Logout
exports.logout = (req, res) => {
    req.session?.destroy(() => {
        res.redirect('/login');
    });
};