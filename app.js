/* ============================================================
   TaskFlow — script.js
   Modular Vanilla JS: Storage, Tasks, UI, Events
   ============================================================ */

'use strict';

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY  = 'taskflow_tasks';
const THEME_KEY    = 'taskflow_theme';
const FILTER_LABELS = {
  all: 'Todas las tareas', pending: 'Tareas pendientes',
  completed: 'Tareas completadas', high: 'Prioridad Alta',
  medium: 'Prioridad Media', low: 'Prioridad Baja',
};

// ── State ──────────────────────────────────────────────────
let tasks        = [];
let activeFilter = 'all';
let searchQuery  = '';
let editingId    = null;
let deleteId     = null;
let sortMode     = 'newest';
let dragSrcIdx   = null;

// ── DOM Refs ───────────────────────────────────────────────
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const taskList     = $('taskList');
const emptyState   = $('emptyState');
const searchInput  = $('searchInput');
const sortSelect   = $('sortSelect');
const sectionTitle = $('sectionTitle');
const toastCont    = $('toastContainer');
const themeToggle  = $('themeToggle');
const themeIcon    = $('themeIcon');

// Modal: add/edit
const taskModal  = $('taskModal');
const modalTitle = $('modalTitle');
const taskTitle  = $('taskTitle');
const taskDesc   = $('taskDesc');
const taskDue    = $('taskDue');
const titleError = $('titleError');

// Modal: delete
const deleteModal   = $('deleteModal');

// ── Storage ────────────────────────────────────────────────
const Storage = {
  load()         { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); },
  save(data)     { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); },
  getTheme()     { return localStorage.getItem(THEME_KEY) || 'dark'; },
  setTheme(t)    { localStorage.setItem(THEME_KEY, t); },
};

// ── Task CRUD ──────────────────────────────────────────────
const TaskManager = {
  create(title, desc, priority, due) {
    const task = {
      id:        crypto.randomUUID(),
      title:     title.trim(),
      desc:      desc.trim(),
      priority,
      due:       due || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(task);
    Storage.save(tasks);
    return task;
  },

  update(id, title, desc, priority, due) {
    tasks = tasks.map(t =>
      t.id === id ? { ...t, title: title.trim(), desc: desc.trim(), priority, due: due || null } : t
    );
    Storage.save(tasks);
  },

  remove(id) {
    tasks = tasks.filter(t => t.id !== id);
    Storage.save(tasks);
  },

  toggle(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    Storage.save(tasks);
  },

  reorder(fromIdx, toIdx, filtered) {
    // Map filtered indices to global indices, then move
    const fromId = filtered[fromIdx].id;
    const toId   = filtered[toIdx].id;
    const fi = tasks.findIndex(t => t.id === fromId);
    const ti = tasks.findIndex(t => t.id === toId);
    const [moved] = tasks.splice(fi, 1);
    tasks.splice(ti, 0, moved);
    Storage.save(tasks);
  },
};

// ── Filtering & Sorting ────────────────────────────────────
function getFiltered() {
  let result = [...tasks];

  // Filter
  if (activeFilter === 'pending')   result = result.filter(t => !t.completed);
  if (activeFilter === 'completed') result = result.filter(t => t.completed);
  if (['high','medium','low'].includes(activeFilter))
    result = result.filter(t => t.priority === activeFilter);

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)
    );
  }

  // Sort
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  if (sortMode === 'newest')   result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortMode === 'oldest')   result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortMode === 'priority') result.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  if (sortMode === 'alpha')    result.sort((a,b) => a.title.localeCompare(b.title));

  return result;
}

// ── Render ─────────────────────────────────────────────────
function render() {
  const filtered = getFiltered();

  // Update header
  sectionTitle.textContent = FILTER_LABELS[activeFilter] || 'Tareas';

  // Empty state
  if (filtered.length === 0) {
    taskList.innerHTML   = '';
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    taskList.innerHTML = filtered.map((t, i) => buildCard(t, i)).join('');
    attachCardEvents(filtered);
  }

  updateStats();
  updateSidebar();
}

function buildCard(t, idx) {
  const created  = new Date(t.createdAt).toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
  const dueHtml  = t.due ? buildDueBadge(t.due) : '';
  const descHtml = t.desc ? `<p class="task-desc">${escapeHtml(t.desc)}</p>` : '';

  return `
    <div class="task-card ${t.completed ? 'completed' : ''}"
         data-id="${t.id}"
         data-priority="${t.priority}"
         data-idx="${idx}"
         draggable="true">
      <input type="checkbox" class="task-check" ${t.completed ? 'checked' : ''}
             aria-label="Marcar como ${t.completed ? 'pendiente' : 'completada'}" />
      <div class="task-body">
        <p class="task-title">${escapeHtml(t.title)}</p>
        ${descHtml}
        <div class="task-meta">
          <span class="task-tag ${t.priority}">${priorityLabel(t.priority)}</span>
          <span class="task-date"><i class="fa-regular fa-clock"></i> ${created}</span>
          ${dueHtml}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn edit"   title="Editar"><i class="fa-solid fa-pencil"></i></button>
        <button class="task-btn delete" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    </div>`;
}

function buildDueBadge(due) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due + 'T00:00:00');
  const overdue = !d ? false : d < today;
  const label = d.toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
  return `<span class="task-due ${overdue ? 'overdue' : ''}">
    <i class="fa-solid fa-calendar-days"></i> ${label}</span>`;
}

function attachCardEvents(filtered) {
  taskList.querySelectorAll('.task-card').forEach((card, i) => {
    const id = card.dataset.id;

    // Toggle
    card.querySelector('.task-check').addEventListener('change', () => {
      TaskManager.toggle(id);
      const t = tasks.find(x => x.id === id);
      toast(t.completed ? 'Tarea completada ✓' : 'Tarea pendiente', t.completed ? 'success' : 'info');
      render();
    });

    // Edit
    card.querySelector('.task-btn.edit').addEventListener('click', () => openEditModal(id));

    // Delete
    card.querySelector('.task-btn.delete').addEventListener('click', () => openDeleteModal(id));

    // Drag & Drop
    card.addEventListener('dragstart', e => {
      dragSrcIdx = i;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend',  () => card.classList.remove('dragging'));
    card.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', e => {
      e.preventDefault();
      card.classList.remove('drag-over');
      if (dragSrcIdx !== null && dragSrcIdx !== i) {
        TaskManager.reorder(dragSrcIdx, i, filtered);
        render();
        toast('Orden actualizado', 'info');
      }
      dragSrcIdx = null;
    });
  });
}

// ── Stats & Sidebar ────────────────────────────────────────
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;
  const urgent    = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  $('statTotal').textContent     = total;
  $('statCompleted').textContent = completed;
  $('statPending').textContent   = pending;
  $('statUrgent').textContent    = urgent;
  $('progressPct').textContent   = pct + '%';
  $('progressFill').style.width  = pct + '%';
  $('progressSub').textContent   = `${completed} de ${total} completadas`;
}

function updateSidebar() {
  $('badgeAll').textContent       = tasks.length;
  $('badgePending').textContent   = tasks.filter(t => !t.completed).length;
  $('badgeCompleted').textContent = tasks.filter(t => t.completed).length;
  $('badgeHigh').textContent      = tasks.filter(t => t.priority === 'high').length;
  $('badgeMedium').textContent    = tasks.filter(t => t.priority === 'medium').length;
  $('badgeLow').textContent       = tasks.filter(t => t.priority === 'low').length;

  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.filter === activeFilter);
  });
}

// ── Modal: Add / Edit ──────────────────────────────────────
let selectedPriority = 'high';

function openAddModal() {
  editingId    = null;
  selectedPriority = 'high';
  modalTitle.textContent = 'Nueva tarea';
  taskTitle.value = '';
  taskDesc.value  = '';
  taskDue.value   = '';
  titleError.classList.remove('visible');
  syncPriorityPills('high');
  taskModal.classList.add('open');
  setTimeout(() => taskTitle.focus(), 100);
}

function openEditModal(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  editingId = id;
  selectedPriority = t.priority;
  modalTitle.textContent = 'Editar tarea';
  taskTitle.value = t.title;
  taskDesc.value  = t.desc;
  taskDue.value   = t.due || '';
  titleError.classList.remove('visible');
  syncPriorityPills(t.priority);
  taskModal.classList.add('open');
  setTimeout(() => taskTitle.focus(), 100);
}

function closeTaskModal() {
  taskModal.classList.remove('open');
  editingId = null;
}

function syncPriorityPills(p) {
  $$('#priorityPills .pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.value === p);
  });
  selectedPriority = p;
}

function saveTask() {
  const title = taskTitle.value.trim();
  if (!title) {
    titleError.classList.add('visible');
    taskTitle.focus();
    return;
  }
  titleError.classList.remove('visible');

  const desc     = taskDesc.value;
  const priority = selectedPriority;
  const due      = taskDue.value;

  if (editingId) {
    TaskManager.update(editingId, title, desc, priority, due);
    toast('Tarea actualizada', 'info');
  } else {
    TaskManager.create(title, desc, priority, due);
    toast('Tarea creada', 'success');
  }

  closeTaskModal();
  render();
}

// ── Modal: Delete ──────────────────────────────────────────
function openDeleteModal(id) {
  deleteId = id;
  deleteModal.classList.add('open');
}

function closeDeleteModal() {
  deleteModal.classList.remove('open');
  deleteId = null;
}

function confirmDelete() {
  if (!deleteId) return;
  TaskManager.remove(deleteId);
  closeDeleteModal();
  render();
  toast('Tarea eliminada', 'error');
}

// ── Theme ──────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  Storage.setTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Toast ──────────────────────────────────────────────────
const TOAST_ICONS = {
  success: 'fa-check',
  error:   'fa-xmark',
  info:    'fa-circle-info',
  warning: 'fa-triangle-exclamation',
};

function toast(msg, type = 'info', duration = 3000) {
  const el = document.createElement('div');
  el.className = `toast ${type} toast-left`;
  el.innerHTML = `
    <span class="toast-icon"><i class="fa-solid ${TOAST_ICONS[type] || 'fa-circle-info'}"></i></span>
    <span>${msg}</span>`;
  toastCont.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function priorityLabel(p) {
  return { high: '🔴 Alta', medium: '🟡 Media', low: '🟢 Baja' }[p] || p;
}

// ── Keyboard Shortcuts ─────────────────────────────────────
document.addEventListener('keydown', e => {
  // Cmd/Ctrl + K → focus search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    return;
  }
  // Escape → close modals
  if (e.key === 'Escape') {
    if (taskModal.classList.contains('open'))   closeTaskModal();
    if (deleteModal.classList.contains('open')) closeDeleteModal();
  }
  // Cmd/Ctrl + Enter → save task (when modal open)
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    if (taskModal.classList.contains('open')) saveTask();
  }
});

// ── Event Listeners ────────────────────────────────────────
function initEvents() {
  // Header
  $('openAddModal').addEventListener('click', openAddModal);
  themeToggle.addEventListener('click', toggleTheme);

  // Search
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    render();
  });

  // Sort
  sortSelect.addEventListener('change', e => {
    sortMode = e.target.value;
    render();
  });

  // Sidebar nav
  document.addEventListener('click', e => {
    const item = e.target.closest('[data-filter]');
    if (item) {
      e.preventDefault();
      activeFilter = item.dataset.filter;
      render();
    }
  });

  // Modal: add/edit
  $('closeModal').addEventListener('click', closeTaskModal);
  $('cancelModal').addEventListener('click', closeTaskModal);
  $('saveTask').addEventListener('click', saveTask);
  taskModal.addEventListener('click', e => { if (e.target === taskModal) closeTaskModal(); });

  // Priority pills
  $$('#priorityPills .pill').forEach(pill => {
    pill.addEventListener('click', () => syncPriorityPills(pill.dataset.value));
  });

  // Modal: delete
  $('closeDeleteModal').addEventListener('click', closeDeleteModal);
  $('cancelDelete').addEventListener('click', closeDeleteModal);
  $('confirmDelete').addEventListener('click', confirmDelete);
  deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

  // Title enter key
  taskTitle.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveTask();
  });
}

// ── Init ───────────────────────────────────────────────────
function init() {
  tasks = Storage.load();
  applyTheme(Storage.getTheme());
  initEvents();
  render();

  // Demo data if empty
  if (tasks.length === 0) seedDemo();
}

function seedDemo() {
  const demo = [
    { title: 'Diseñar nuevo dashboard de analítica', priority: 'high',   desc: 'Incluir métricas de conversión y retención de usuarios.' },
    { title: 'Revisar PRs pendientes en GitHub',      priority: 'medium', desc: '' },
    { title: 'Actualizar documentación de la API',    priority: 'low',    desc: 'Agregar ejemplos de respuesta para los nuevos endpoints.' },
    { title: 'Reunión de planificación Q3',            priority: 'high',   desc: 'Preparar agenda y objetivos del trimestre.' },
    { title: 'Optimizar queries lentas en producción', priority: 'medium', desc: '' },
  ];
  demo.forEach(d => TaskManager.create(d.title, d.desc, d.priority, null));
  render();
}

init();