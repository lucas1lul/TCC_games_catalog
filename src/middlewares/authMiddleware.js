function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: "Não autenticado" });
  }
  next();
}

function exigirAdmin(req, res, next) {
  if (!req.session.usuario || req.session.usuario.tipo !== "admin") {
    return res.status(403).json({ erro: "Acesso restrito a administradores" });
  }
  next();
}

function exigirProfessor(req, res, next) {
  if (!req.session.usuario || req.session.usuario.tipo !== "professor") {
    return res.status(403).json({ erro: "Apenas professores podem avaliar" });
  }
  next();
}

module.exports = {
  exigirLogin,
  exigirAdmin,
  exigirProfessor
};