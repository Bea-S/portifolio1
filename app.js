const STORAGE_KEY = 'todo-qa-project-tasks';
const API_ROOT = '/api/tasks';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const ownerInput = document.querySelector('#owner-input');
const startDateInput = document.querySelector('#start-date');
const endDateInput = document.querySelector('#end-date');
const emptyState = document.querySelector('#empty-state');
const taskCounter = document.querySelector('#task-counter');
const cancelEditBtn = document.querySelector('#cancel-edit');
const submitButton = document.querySelector('#submit-button');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.querySelector('#theme-toggle');
const taskRowsContainer = document.querySelector('#task-rows');
const addNewRowBtn = document.querySelector('#add-new-row');

const state = {
  tasks: [],
  currentFilter: 'all',
  editingTaskId: null,
  apiAvailable: true,
};

async function fetchTasksFromApi() {
  try {
    const url = state.currentFilter && state.currentFilter !== 'all'
      ? `${API_ROOT}?status=${encodeURIComponent(state.currentFilter)}`
      : API_ROOT;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    // Normalize to our internal shape
    state.tasks = data.map((t) => ({
      id: String(t.id),
      title: t.title || t.title === '' ? t.title : '',
      completed: Boolean(t.completed),
      ownerName: t.ownerName || null,
      startDate: t.startDate || null,
      endDate: t.endDate || null,
      level: t.level || null,
    }));
    saveTasksToLocal();
    state.apiAvailable = true;
  } catch (err) {
    state.apiAvailable = false;
    loadTasksFromLocal();
  }
}

// Theme handling
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('dark');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
  }
}

function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }
}

function loadTasksFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.tasks = [];
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      state.tasks = parsed.map((t) => ({
        id: String(t.id),
        title: typeof t.title === 'string' ? t.title : '',
        completed: Boolean(t.completed),
        ownerName: t.ownerName || null,
        startDate: t.startDate || null,
        endDate: t.endDate || null,
        level: t.level || null,
      }));
    } else {
      state.tasks = [];
    }
  } catch (e) {
    state.tasks = [];
  }
}

function saveTasksToLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (e) {
    // ignore
  }
}

async function renderTasks() {
  // render as grid rows
  if (!taskRowsContainer) return;
  taskRowsContainer.innerHTML = '';
  const visible = getVisibleTasks();

  if (visible.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  visible.forEach((task) => {
    const row = createRowElement(task);
    taskRowsContainer.appendChild(row);
  });

  updateCounter();
}

function createRowElement(task) {
  const row = document.createElement('div');
  row.className = 'task-row';
  row.dataset.id = task.id;

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.value = task.title || '';
  titleInput.placeholder = 'Tarefa';
  titleInput.disabled = true;
  if (!task.title && !task.id.startsWith('new-')) {
    titleInput.value = ['Estudar', 'Resumir', 'Refazer', 'Concluir'][Math.floor(Math.random() * 4)];
  }

  const startInput = document.createElement('input');
  startInput.type = 'date';
  startInput.value = task.startDate || '';
  startInput.disabled = true;

  const endInput = document.createElement('input');
  endInput.type = 'date';
  endInput.value = task.endDate || '';
  endInput.disabled = true;

  const levelSelect = document.createElement('select');
  ['', 'facil', 'intermediario', 'dificil'].forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt === '' ? '' : (opt === 'facil' ? 'Fácil' : opt === 'intermediario' ? 'Intermediário' : 'Difícil');
    if (task.level === opt) o.selected = true;
    levelSelect.appendChild(o);
  });
  levelSelect.disabled = true;

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.textContent = 'Editar';
  editBtn.addEventListener('click', async () => {
    const editing = titleInput.disabled === false;
    if (editing) {
      const payload = {
        title: titleInput.value.trim(),
        startDate: startInput.value || null,
        endDate: endInput.value || null,
        level: levelSelect.value || null,
      };
      if (String(task.id).startsWith('new-')) {
        const created = await createTask(payload);
        if (created && created.id) {
          task.id = String(created.id);
          row.dataset.id = task.id;
        }
      } else {
        await saveTask(task.id, payload);
      }
      titleInput.disabled = true;
      startInput.disabled = true;
      endInput.disabled = true;
      levelSelect.disabled = true;
      editBtn.textContent = 'Editar';
    } else {
      titleInput.disabled = false;
      startInput.disabled = false;
      endInput.disabled = false;
      levelSelect.disabled = false;
      editBtn.textContent = 'Salvar';
      titleInput.focus();
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Excluir';
  deleteBtn.addEventListener('click', async () => {
    const confirmed = window.confirm('Deseja realmente excluir esta tarefa?');
    if (confirmed) {
      await deleteTask(task.id);
    }
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = 'Adicionar abaixo';
  addBtn.addEventListener('click', () => insertBlankRowAfter(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  actions.appendChild(addBtn);

  row.appendChild(titleInput);
  row.appendChild(startInput);
  row.appendChild(endInput);
  row.appendChild(levelSelect);
  row.appendChild(actions);

  return row;
}

function insertBlankRowAfter(afterId) {
  const idx = state.tasks.findIndex((t) => String(t.id) === String(afterId));
  const newTask = { id: `new-${Date.now()}`, title: '', ownerName: null, startDate: null, endDate: null, level: null, completed: false };
  if (idx === -1) {
    state.tasks.push(newTask);
  } else {
    state.tasks.splice(idx + 1, 0, newTask);
  }
  saveTasksToLocal();
  renderTasks();
}

async function createTask(payload) {
  if (state.apiAvailable) {
    try {
      const res = await fetch(API_ROOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: payload.title || '', ownerName: payload.ownerName || null, startDate: payload.startDate || null, endDate: payload.endDate || null, level: payload.level || null }),
      });
      if (!res.ok) throw new Error('API error');
      const created = await res.json();
      const idx = state.tasks.findIndex((t) => t.id && String(t.id).startsWith('new-'));
      if (idx !== -1) state.tasks[idx] = { id: String(created.id), title: created.title, completed: Boolean(created.completed), ownerName: created.ownerName || null, startDate: created.startDate || null, endDate: created.endDate || null, level: created.level || null };
      saveTasksToLocal();
      renderTasks();
      return created;
    } catch (e) {
      state.apiAvailable = false;
    }
  }
  const idx = state.tasks.findIndex((t) => t.id && String(t.id).startsWith('new-'));
  const local = { id: Date.now().toString(), title: payload.title || '', completed: false, ownerName: payload.ownerName || null, startDate: payload.startDate || null, endDate: payload.endDate || null, level: payload.level || null };
  if (idx !== -1) state.tasks[idx] = local;
  saveTasksToLocal();
  renderTasks();
  return local;
}

async function saveTask(id, payload) {
  const task = state.tasks.find((t) => String(t.id) === String(id));
  if (!task) return;
  if (state.apiAvailable) {
    try {
      const res = await fetch(`${API_ROOT}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: payload.title, completed: task.completed, ownerName: task.ownerName || null, startDate: payload.startDate, endDate: payload.endDate, level: payload.level }),
      });
      if (!res.ok) throw new Error('API error');
      const updated = await res.json();
      task.title = updated.title;
      task.startDate = updated.startDate || null;
      task.endDate = updated.endDate || null;
      task.level = updated.level || null;
      saveTasksToLocal();
      renderTasks();
      return;
    } catch (e) {
      state.apiAvailable = false;
    }
  }
  task.title = payload.title;
  task.startDate = payload.startDate || null;
  task.endDate = payload.endDate || null;
  task.level = payload.level || null;
  saveTasksToLocal();
  renderTasks();
}

function getVisibleTasks() {
  if (state.currentFilter === 'active') return state.tasks.filter((t) => !t.completed);
  if (state.currentFilter === 'completed') return state.tasks.filter((t) => t.completed);
  return state.tasks;
}

function updateCounter() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  if (taskCounter) taskCounter.textContent = `${total} tarefa${total === 1 ? '' : 's'} • ${completed} concluída${completed === 1 ? '' : 's'}`;
}

function resetForm() {
  taskInput.value = '';
  if (ownerInput) ownerInput.value = '';
  if (startDateInput) startDateInput.value = '';
  if (endDateInput) endDateInput.value = '';
  taskInput.focus();
  state.editingTaskId = null;
  submitButton.textContent = 'Adicionar';
  cancelEditBtn.classList.add('hidden');
}

function startEditing(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  state.editingTaskId = taskId;
  taskInput.value = task.title;
  if (ownerInput) ownerInput.value = task.ownerName || '';
  if (startDateInput) startDateInput.value = task.startDate || '';
  if (endDateInput) endDateInput.value = task.endDate || '';
  taskInput.focus();
  taskInput.setSelectionRange(taskInput.value.length, taskInput.value.length);
  submitButton.textContent = 'Salvar';
  cancelEditBtn.classList.remove('hidden');
}

async function addTask(taskText) {
  const title = taskText.trim();
  if (!title) return;
  const ownerName = ownerInput ? ownerInput.value.trim() : null;
  const startDate = startDateInput ? startDateInput.value || null : null;
  const endDate = endDateInput ? endDateInput.value || null : null;

  if (state.apiAvailable) {
    try {
      const res = await fetch(API_ROOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ownerName, startDate, endDate }),
      });
      if (!res.ok) throw new Error('API error');
      const created = await res.json();
      state.tasks.unshift({ id: String(created.id), title: created.title, completed: Boolean(created.completed), ownerName: created.ownerName || null, startDate: created.startDate || null, endDate: created.endDate || null });
      saveTasksToLocal();
      await renderTasks();
      return;
    } catch (e) {
      state.apiAvailable = false;
    }
  }

  // fallback
  const task = { id: Date.now().toString(), title, completed: false, ownerName: ownerName || null, startDate: startDate || null, endDate: endDate || null };
  state.tasks.unshift(task);
  saveTasksToLocal();
  renderTasks();
}

async function updateTask(taskId, newTitle) {
  const title = newTitle.trim();
  if (!title) return;
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  const ownerName = ownerInput ? ownerInput.value.trim() : undefined;
  const startDate = startDateInput ? (startDateInput.value || null) : undefined;
  const endDate = endDateInput ? (endDateInput.value || null) : undefined;

  if (state.apiAvailable) {
    try {
      const res = await fetch(`${API_ROOT}/${encodeURIComponent(taskId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: task.completed, ownerName, startDate, endDate }),
      });
      if (!res.ok) throw new Error('API error');
      const updated = await res.json();
      task.title = updated.title;
      task.ownerName = updated.ownerName || null;
      task.startDate = updated.startDate || null;
      task.endDate = updated.endDate || null;
      saveTasksToLocal();
      renderTasks();
      return;
    } catch (e) {
      state.apiAvailable = false;
    }
  }

  // fallback local update
  task.title = title;
  saveTasksToLocal();
  renderTasks();
}

async function deleteTask(taskId) {
  if (state.apiAvailable) {
    try {
      const res = await fetch(`${API_ROOT}/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
      if (res.status !== 204 && !res.ok) throw new Error('API error');
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
      saveTasksToLocal();
      renderTasks();
      return;
    } catch (e) {
      state.apiAvailable = false;
    }
  }

  state.tasks = state.tasks.filter((t) => t.id !== taskId);
  saveTasksToLocal();
  renderTasks();
}

async function toggleTaskStatus(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  if (state.apiAvailable) {
    try {
      const res = await fetch(`${API_ROOT}/${encodeURIComponent(taskId)}/toggle`, { method: 'PATCH' });
      if (!res.ok) throw new Error('API error');
      const updated = await res.json();
      task.completed = Boolean(updated.completed);
      saveTasksToLocal();
      renderTasks();
      return;
    } catch (e) {
      state.apiAvailable = false;
    }
  }

  // fallback local toggle
  task.completed = !task.completed;
  saveTasksToLocal();
  renderTasks();
}

function handleSubmit(event) {
  event.preventDefault();
  const value = taskInput.value;
  if (state.editingTaskId) {
    updateTask(state.editingTaskId, value);
    resetForm();
    return;
  }
  addTask(value);
  resetForm();
}

function handleFilterClick(event) {
  const target = event.currentTarget;
  const selectedFilter = target.dataset.filter;
  state.currentFilter = selectedFilter;
  filterButtons.forEach((button) => {
    const isActive = button === target;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  // reload from API when filtering
  fetchTasksFromApi().then(renderTasks);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', handleFilterClick);
  button.setAttribute('aria-selected', String(button.dataset.filter === state.currentFilter));
});

if (addNewRowBtn) {
  addNewRowBtn.addEventListener('click', () => {
    const newTask = { id: `new-${Date.now()}`, title: '', ownerName: null, startDate: null, endDate: null, level: null, completed: false };
    state.tasks.push(newTask);
    saveTasksToLocal();
    renderTasks();
  });
}

if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);
if (taskForm) taskForm.addEventListener('submit', handleSubmit);

// initial load
(async function init() {
  await fetchTasksFromApi();
  renderTasks();
  initTheme();
})();
