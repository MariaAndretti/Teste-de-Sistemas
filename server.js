const express = require('express');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let tarefas = [];


// ✅ Criar nova tarefa (nome obrigatório, feito = false)
app.post('/tarefas', (req, res) => {
  const { nome } = req.body;


  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório' });
  }


  const novaTarefa = {
    nome,
    feito: false,
  };


  tarefas.push(novaTarefa);


  res.status(201).json(novaTarefa);
});


// 📄 Listar tarefas
app.get('/tarefas', (req, res) => {
  res.json(tarefas);
});


// ✏️ Editar tarefa (buscar por nome e atualizar feito)
app.put('/tarefas', (req, res) => {
  const { nome, feito } = req.body;


  if (!nome || (feito !== 'true' && feito !== 'false')) {
    return res
      .status(400)
      .json({
        erro: 'Nome e feito (string "true" ou "false") são obrigatórios',
      });
  }


  const tarefa = tarefas.find((t) => t.nome === nome);


  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa não encontrada' });
  }


  // Converte string 'true'/'false' para boolean true/false
  tarefa.feito = feito === 'true';


  res.json(tarefa);
});


app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
