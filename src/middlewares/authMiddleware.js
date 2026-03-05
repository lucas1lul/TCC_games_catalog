exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.session.user;

    if (!user || !roles.includes(user.perfil)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    next();
  };
};