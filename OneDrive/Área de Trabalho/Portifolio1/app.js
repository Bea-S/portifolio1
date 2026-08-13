const STORAGE_KEY = 'todo-qa-project-tasks';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskCounter = document.querySelector('#task-counter');
const cancelEditBtn = document.querySelector('#cancel-edit');
const submitButton = document.querySelector('#submit-button');
const filterButtons = document.querySelectorAll('.filter-btn');

const state = {
  tasks: loadTasks(),
  currentFilter: 'all',
  editingTaskId: null,
};

function loadTasks() {
  const rawTasks = localStorage.getItem(STORAGE_KEY);

  if (!rawTasks) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawTasks);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Normalize loaded tasks to ensure consistent types (especially `completed`).
    return parsed.map((task) => ({
      id: task && task.id != null ? String(task.id) : Date.now().toString(),
      text: task && typeof task.text === 'string' ? task.text : '',
      completed: Boolean(task && task.completed),
    }));
  } catch (error) {
    console.error('Erro ao ler tarefas:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function getVisibleTasks() {
  if (state.currentFilter === 'active') {
    return state.tasks.filter((task) => !task.completed);
  }

  if (state.currentFilter === 'completed') {
    return state.tasks.filter((task) => task.completed);
  }

  return state.tasks;
}

function updateCounter() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  taskCounter.textContent = `${total} tarefa${total === 1 ? '' : 's'} • ${completed} concluída${completed === 1 ? '' : 's'}`;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.innerHTML = '';

  if (visibleTasks.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  visibleTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;
    item.dataset.id = task.id;

    const main = document.createElement('div');
    main.className = 'task-main';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Marcar tarefa como ${task.completed ? 'incompleta' : 'concluída'}: ${task.text}`);
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    main.appendChild(checkbox);
    main.appendChild(text);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'action-btn edit-btn';
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => startEditing(task.id));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'action-btn delete-btn';
    deleteButton.textContent = 'Excluir';
    deleteButton.addEventListener('click', () => {
      const confirmed = window.confirm('Deseja realmente excluir esta tarefa?');
      if (confirmed) {
        deleteTask(task.id);
      }
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(main);
    item.appendChild(actions);
    taskList.appendChild(item);
  });

  updateCounter();
}

function resetForm() {
  taskInput.value = '';
  taskInput.focus();
  state.editingTaskId = null;
  submitButton.textContent = 'Adicionar';
  cancelEditBtn.classList.add('hidden');
}

function startEditing(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  state.editingTaskId = taskId;
  taskInput.value = task.text;
  taskInput.focus();
  taskInput.setSelectionRange(taskInput.value.length, taskInput.value.length);
  submitButton.textContent = 'Salvar';
  cancelEditBtn.classList.remove('hidden');
}

function addTask(taskText) {
  const trimmedText = taskText.trim();

  if (!trimmedText) {
    return;
  }

  const task = {
    id: Date.now().toString(),
    text: trimmedText,
    completed: false,
  };

  state.tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function updateTask(taskId, newText) {
  const trimmedText = newText.trim();

  if (!trimmedText) {
    return;
  }

  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  task.text = trimmedText;
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);

  if (state.editingTaskId === taskId) {
    resetForm();
  }

  saveTasks();
  renderTasks();
}

function toggleTaskStatus(taskId) {
  state.tasks = state.tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });

  saveTasks();
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

  renderTasks();
}

filterButtons.forEach((button) => {
  button.addEventListener('click', handleFilterClick);
  button.setAttribute('aria-selected', String(button.dataset.filter === state.currentFilter));
});

cancelEditBtn.addEventListener('click', resetForm);
taskForm.addEventListener('submit', handleSubmit);

renderTasks();
