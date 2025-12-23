module.exports = (req, res, next) => {
    // Verifica se existe sessão e usuário logado
    if (!req.session || !req.session.usuario) {
        // Se for API, retorna erro
        return res.status(401).json({
            mensagem: 'Acesso negado. Usuário não autenticado.'
        });
    }

    // Usuário autenticado → segue a requisição
    next();
};
