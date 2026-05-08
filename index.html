/* ============================================================
   TaskFlow — script.js (REFORMATEADO PRO)
   ============================================================ */

'use strict';

/* ─────────────────────────────
   CONFIG
──────────────────────────── */
const STORAGE_KEY = 'taskflow_tasks';
const THEME_KEY   = 'taskflow_theme';

const FILTER_LABELS = {
  all: 'Todas las tareas',
  pending: 'Tareas pendientes',
  completed: 'Tareas completadas',
  high: 'Prioridad Alta',
  medium: 'Prioridad Media',
  low: 'Prioridad Baja',
};

/* ─────────────────────────────
   STATE
──────────────────────────── */
let tasks = [];
let activeFilter = 'all';
let searchQuery = '';
let editingId = null;
let deleteId = null;
let sortMode = 'newest';
let dragSrcIdx = null;

/* ─────────────────────────────
   DOM HELPERS
──────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ─────────────────────────────
   DOM ELEMENTS
──────────────────────────── */
const taskList = $('taskList');
const emptyState = $('emptyState');
const searchInput = $('searchInput');
const sortSelect = $('sortSelect');
const sectionTitle = $('sectionTitle');
const toastCont = $('toastContainer');

const themeToggle = $('themeToggle');
const themeIcon = $('themeIcon');

/* Modals */
const taskModal = $('taskModal');
const taskTitle = $('taskTitle');
const taskDesc = $('taskDesc');
const taskDue = $('taskDue');
const modalTitle = $('modalTitle');
const titleError = $('titleError');

const deleteModal = $('deleteModal');

/* ─────────────────────────────
   STORAGE
──────────────────────────── */
const Storage = {
  load() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },
  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  },
  setTheme(t) {
    localStorage.setItem(THEME_KEY, t);
  }
};

/* ─────────────────────────────
   TASK CRUD
──────────────────────────── */
const TaskManager = {

  create(title, desc, priority, due) {
    const task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      desc: desc.trim(),
      priority,
      due: due || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(task);
    Storage.save(tasks);
    return task;
  },

  update(id, title, desc, priority, due) {
    tasks = tasks.map(t =>
      t.id === id
        ? { ...t, title: title.trim(), desc: desc.trim(), priority, due }
        : t
    );
    Storage.save(tasks);
  },

  remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    Storage.save(tasks);
  },

  toggle(id) {
    tasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    Storage.save(tasks);
  },

  reorder(from, to, filtered) {
    const fromId = filtered[from].id;
    const toId = filtered[to].id;

    const fi = tasks.findIndex(t => t.id === fromId);
    const ti = tasks.findIndex(t => t.id === toId);

    const [moved] = tasks.splice(fi, 1);
    tasks.splice(ti, 0, moved);

    Storage.save(tasks);
  },
};

/* ─────────────────────────────
   FILTER + SORT
──────────────────────────── */
function getFiltered() {
  let result = [...tasks];

  // filter
  if (activeFilter === 'pending') result = result.filter(t => !t.completed);
  if (activeFilter === 'completed') result = result.filter(t => t.completed);

  if (['high','medium','low'].includes(activeFilter)) {
    result = result.filter(t => t.priority === activeFilter);
  }

  // search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)
    );
  }

  // sort
  const order = { high: 0, medium: 1, low: 2 };

  if (sortMode === 'newest')
    result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sortMode === 'oldest')
    result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (sortMode === 'priority')
    result.sort((a,b) => order[a.priority] - order[b.priority]);

  if (sortMode === 'alpha')
    result.sort((a,b) => a.title.localeCompare(b.title));

  return result;
}

/* ─────────────────────────────
   RENDER
──────────────────────────── */
function render() {
  const filtered = getFiltered();

  sectionTitle.textContent = FILTER_LABELS[activeFilter] || 'Tareas';

  if (!filtered.length) {
    taskList.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  taskList.innerHTML = filtered.map(buildCard).join('');
  attachEvents(filtered);

  updateStats();
}

/* ─────────────────────────────
   CARD
──────────────────────────── */
function buildCard(t) {
  const created = new Date(t.createdAt).toLocaleDateString('es-PE');

  return `
  <div class="task-card ${t.completed ? 'completed' : ''}" data-id="${t.id}">
    <input type="checkbox" class="check" ${t.completed ? 'checked' : ''} />

    <div>
      <strong>${t.title}</strong>
      <p>${t.desc || ''}</p>
      <small>${t.priority} • ${created}</small>
    </div>

    <div class="actions">
      <button class="edit">✏️</button>
      <button class="delete">🗑️</button>
    </div>
  </div>`;
}

/* ─────────────────────────────
   EVENTS
──────────────────────────── */
function attachEvents(filtered) {

  document.querySelectorAll('.task-card').forEach((card, i) => {

    const id = card.dataset.id;

    card.querySelector('.check').onclick = () => {
      TaskManager.toggle(id);
      render();
    };

    card.querySelector('.delete').onclick = () => {
      TaskManager.remove(id);
      render();
    };

    card.querySelector('.edit').onclick = () => openEdit(id);

  });
}

/* ─────────────────────────────
   EDIT
──────────────────────────── */
function openEdit(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  editingId = id;

  taskTitle.value = t.title;
  taskDesc.value = t.desc;
  taskDue.value = t.due || '';

  taskModal.classList.add('open');
}

function saveTask() {
  const title = taskTitle.value.trim();
  if (!title) return;

  if (editingId) {
    TaskManager.update(editingId, title, taskDesc.value, 'medium', taskDue.value);
  } else {
    TaskManager.create(title, taskDesc.value, 'medium', taskDue.value);
  }

  editingId = null;
  taskModal.classList.remove('open');

  render();
}

/* ─────────────────────────────
   STATS
──────────────────────────── */
function updateStats() {
  $('statTotal').textContent = tasks.length;
  $('statCompleted').textContent = tasks.filter(t => t.completed).length;
}

/* ─────────────────────────────
   INIT
──────────────────────────── */
function init() {
  tasks = Storage.load();
  render();
}

init();