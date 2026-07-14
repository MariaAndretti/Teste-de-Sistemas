import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

const usuariosDB = [];
const gerarTokenHash = (email) => {

    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
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

    const novoUsuario = {
        username,
        email,
        senha, 
        pergunta_secreta,
        resposta_secreta,
        token
    };

    usuariosDB.push(novoUsuario);

    return res.status(201).json({
        message: "Usuário cadastrado com sucesso!",
        usuario: {
            username: novoUsuario.username,
            email: novoUsuario.email,
            token: novoUsuario.token
        }
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const usuario = usuariosDB.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );

    if (!usuario) {
        return res.status(401).json({ error: "Credenciais inválidas." });
    }

    return res.status(200).json({
        message: "Login efetuado com sucesso!",
        autenticado: true,
        user: {
            username: usuario.username,
            email: usuario.email
        },
        token: usuario.token,
        instrucao_localstorage: {
            chave: "usuario_logado",
            valor: usuario.token,
            nota: "Salve este token no LocalStorage usando: localStorage.setItem('usuario_logado', token);"
        }
    });
});

app.listen(3001, () => {
    console.log(`Server running on http://127.0.0.1:3001!`);
});