const express = require('express');
const md5 = require('md5');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let logins = [];


app.post('/login', (req, res) => {
  const { nome, email, senha } = req.body;
  const senhaCriptografada = md5(senha);


  logins.push({ nome, email, senha: senhaCriptografada });


  res.json(logins);
});

app.get('/', (req, res) => {
  res.json("Bem-Vindos!");
});

app.get('/login', (req, res) => {
  res.json(logins);
});

app.delete('/login', (req, res) => {
  const { nome, email, senha } = req.body;
  logins = logins.filter(u => u.nome, email, senha !== nome, email, senha);
  res.json(logins);
});


app.listen(3001, () => {
console.log('Servidor rodando em http://localhost:3001');
});

