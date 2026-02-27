exports.contactDeveloper = (req, res) => {
    console.log("Mensagem enviada ao dev:", req.body);
    res.json({ mensagem: "Mensagem enviada ao desenvolvedor!" });
};