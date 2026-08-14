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
  { id: '1', title: 'Estudar', ownerName: 'Beatriz', startDate: '2026-08-10', endDate: '2026-08-14', level: 'facil', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', title: 'Resumir', ownerName: 'Carlos', startDate: '2026-08-01', endDate: '2026-08-05', level: 'intermediario', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', title: 'Refazer', ownerName: 'Beatriz', startDate: '2026-08-15', endDate: '2026-09-01', level: 'dificil', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', title: 'Concluir', ownerName: 'Ana', startDate: '2026-07-10', endDate: '2026-08-20', level: 'intermediario', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

function serializeTask(task) {
  return {
    id: task.id,
    title: task.title,
    ownerName: task.ownerName || null,
    startDate: task.startDate || null,
    endDate: task.endDate || null,
    level: task.level || null,
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
  const { title, completed = false, ownerName, startDate, endDate, level } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'O campo title é obrigatório.' });
  }

  const now = new Date().toISOString();
  const task = {
    id: `task-${Date.now()}`,
    title: title.trim(),
    ownerName: ownerName ? String(ownerName).trim() : null,
    startDate: startDate || null,
    endDate: endDate || null,
    level: level || null,
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

  const { title, completed, ownerName, startDate, endDate, level } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'O campo title é obrigatório.' });
  }

  task.title = title.trim();
  task.completed = Boolean(completed);
  task.ownerName = ownerName !== undefined ? ownerName : task.ownerName;
  task.startDate = startDate !== undefined ? startDate : task.startDate;
  task.endDate = endDate !== undefined ? endDate : task.endDate;
  task.level = level !== undefined ? level : task.level;
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
