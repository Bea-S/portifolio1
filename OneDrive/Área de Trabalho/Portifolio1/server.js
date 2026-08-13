const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const app = express();
const PORT = process.env.PORT || 4173;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const tasks = [
  { id: '1', title: 'Estudar QA', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', title: 'Revisar requisitos', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

function serializeTask(task) {
  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function buildTaskResponse(task) {
  return serializeTask(task);
}

app.get('/api/tasks', (req, res) => {
  const { status } = req.query;

  let result = tasks.map(buildTaskResponse);

  if (status === 'active') {
    result = result.filter((task) => !task.completed);
  }

  if (status === 'completed') {
    result = result.filter((task) => task.completed);
  }

  res.json(result);
});

app.post('/api/tasks', (req, res) => {
  const { title, completed = false } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'O campo title é obrigatório.' });
  }

  const now = new Date().toISOString();
  const task = {
    id: `task-${Date.now()}`,
    title: title.trim(),
    completed: Boolean(completed),
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(task);
  return res.status(201).json(buildTaskResponse(task));
});

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' });
  }

  return res.json(buildTaskResponse(task));
});

app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' });
  }

  const { title, completed } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'O campo title é obrigatório.' });
  }

  task.title = title.trim();
  task.completed = Boolean(completed);
  task.updatedAt = new Date().toISOString();

  return res.json(buildTaskResponse(task));
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex((item) => item.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' });
  }

  tasks.splice(taskIndex, 1);
  return res.status(204).send();
});

app.patch('/api/tasks/:id/toggle', (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Tarefa não encontrada.' });
  }

  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();

  return res.json(buildTaskResponse(task));
});

const swaggerDocument = YAML.parse(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

app.get('/swagger-ui.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-ui.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Endpoint não encontrado.' });
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Swagger em http://localhost:${PORT}/swagger-ui.html`);
});
