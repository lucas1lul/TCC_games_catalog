const bcrypt = require('bcrypt');
const { readUsers, saveUsers } = require('../models/usersModel'); // Ajuste o caminho conforme necessário

exports.register = async (req, res) => {
    exports.register = async (req, res) => {
        const { nome, email, senha, perfil } = req.body;
        let usuarios = readUsers(); // Usa a função do Model
    
        const perfisValidos = ["aluno", "professor", "administrador", "profissional_ti"];
        if (!perfil || !perfisValidos.includes(perfil)) {
            return res.status(400).json({ mensagem: 'Perfil inválido ou ausente.' });
        }
    
        const existe = usuarios.find(u => u.email === email);
        if (existe) {
            return res.status(409).json({ mensagem: 'Email já registrado!' });
        }
    
        const hash = await bcrypt.hash(senha, 10);
        const proximoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    
        const novoUsuario = {
            id: proximoId,
            nome,
            email,
            senha: hash,
            perfil: perfil 
        };
    
        usuarios.push(novoUsuario);
        saveUsers(usuarios); // Usa a função do Model para salvar
    
        res.status(201).json({ 
            mensagem: 'Usuário registrado!', 
            usuario: { 
                id: novoUsuario.id, 
                nome: novoUsuario.nome, 
                email: novoUsuario.email,
                perfil: novoUsuario.perfil
            } 
        });
    };// ... (Copie todo o código da função register aqui)
    const { nome, email, senha, perfil } = req.body;
    let usuarios = readUsers();

    // ... lógica de validação e hash ...

};

exports.login = async (req, res) => {
    const { email, senha } = req.body;
        const usuarios = readUsers(); // Usa a função do Model
    
        const usuario = usuarios.find(u => u.email === email);
        if (!usuario) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
        }
    
        const match = await bcrypt.compare(senha, usuario.senha);
        if (!match) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas!' });
        }
    
        // Login bem-sucedido
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