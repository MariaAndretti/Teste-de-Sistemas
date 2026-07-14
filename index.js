const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

app.use(express.json()); 

const usuariosDB = [];
const favoritosDB = []; 

const gerarTokenHash = (email) => {
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

const autenticarUsuario = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    const usuarioLogado = usuariosDB.find(u => u.token === token);

    if (!usuarioLogado) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    req.usuario = usuarioLogado;
    next();
};

app.post('/cadastro', (req, res) => {
    const { username, email, senha, repete_senha, pergunta_secreta, resposta_secreta } = req.body;

    if (!username || !email || !senha || !repete_senha || !pergunta_secreta || !resposta_secreta) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    if (senha !== repete_senha) {
        return res.status(400).json({ error: "As senhas informadas não coincidem." });
    }

    const usuarioExistente = usuariosDB.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (usuarioExistente) {
        return res.status(400).json({ error: "Este e-mail já está cadastrado." });
    }

    const token = gerarTokenHash(email);

    const novoUsuario = { username, email, senha, pergunta_secreta, resposta_secreta, token };
    usuariosDB.push(novoUsuario);

    return res.status(201).json({
        message: "Usuário cadastrado com sucesso!",
        usuario: { username, email, token }
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const usuario = usuariosDB.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);

    if (!usuario) {
        return res.status(401).json({ error: "Email ou senha incorreto" });
    }

    return res.status(200).json({
        message: "Login efetuado com sucesso!",
        token: usuario.token,
        chave_localstorage: "usuario_logado"
    });
});

app.post('/favoritos', autenticarUsuario, (req, res) => {
    const { nomeSite, url } = req.body;

    if (!nomeSite || !url) {
        return res.status(400).json({ error: "Nome do site e endereço URL são obrigatórios." });
    }

    const novoFavorito = {
        id: crypto.randomUUID(), 
        usuarioEmail: req.usuario.email,
        nomeSite,
        url
    };

    favoritosDB.push(novoFavorito);

    return res.status(201).json({
        message: "Favorito salvo com sucesso!",
        favorito: novoFavorito
    });
});

app.get('/favoritos', autenticarUsuario, (req, res) => {
    const meusFavoritos = favoritosDB.filter(f => f.usuarioEmail === req.usuario.email);
    
    return res.status(200).json(meusFavoritos);
});

app.delete('/favoritos/:id', autenticarUsuario, (req, res) => {
    const { id } = req.params;

    const indiceFavorito = favoritosDB.findIndex(f => f.id === id);

    if (indiceFavorito === -1) {
        return res.status(404).json({ error: "Favorito não encontrado." });
    }

    if (favoritosDB[indiceFavorito].usuarioEmail !== req.usuario.email) {
        return res.status(403).json({ error: "Você não tem permissão para remover esse favorito" });
    }

    favoritosDB.splice(indiceFavorito, 1);

    return res.status(200).json({ message: "Favorito removido com sucesso!" });
});

app.listen(3001, () => {
    console.log(`Server running on http://127.0.0.1:3001!`);
});