// ============================================
//  TaskFlow — app.js
// ============================================

// ── Estado de la aplicación ──────────────────
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
let filter = 'todas';
let search = '';

// ── Guardar en localStorage ──────────────────
const save = () => {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
};

// ── Referencias al DOM ───────────────────────
const taskInput      = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn         = document.getElementById('addBtn');
const searchInput    = document.getElementById('searchInput');
const taskList       = document.getElementById('taskList');
const taskCount      = document.getElementById('taskCount');
const statTotal      = document.getElementById('statTotal');
const statDone       = document.getElementById('statDone');
const statHigh       = document.getElementById('statHigh');
const progressFill   = document.getElementById('progressFill');
const progressPct    = document.getElementById('progressPct');
const themeBtn       = document.getElementById('themeBtn');
const filterBtns     = document.querySelectorAll('.filter-btn');

// ============================================
//  TEMA CLARO / OSCURO
// ============================================
const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('taskflow_theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ============================================
//  AGREGAR TAREA
// ============================================
const addTask = () => {
  const name = taskInput.value.trim();

  // Validar campo vacío
  if (!name) {
    taskInput.focus();
    taskInput.style.borderColor = 'var(--high)';
    setTimeout(() => (taskInput.style.borderColor = ''), 800);
    return;
  }

  // Crear objeto tarea
  const task = {
    id: Date.now(),
    name,
    priority: prioritySelect.value,
    done: false,
    createdAt: new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };

  tasks.unshift(task); // Agregar al inicio
  save();
  taskInput.value = '';
  taskInput.focus();
  render();
};

// Eventos para agregar
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// ============================================
//  COMPLETAR TAREA
// ============================================
const toggleDone = (id) => {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    save();
    render();
  }
};

// ============================================
//  ELIMINAR TAREA
// ============================================
const deleteTask = (id) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      save();
      render();
    }, 200);
  }
};

// ============================================
//  FILTROS
// ============================================
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

// ============================================
//  BUSCADOR
// ============================================
searchInput.addEventListener('input', () => {
  search = searchInput.value.toLowerCase();
  render();
});

// ============================================
//  RENDER PRINCIPAL
// ============================================
const priorityOrder = { alta: 0, media: 1, baja: 2 };

const render = () => {
  // ── Calcular estadísticas ──
  const total = tasks.length;
  const done  = tasks.filter((t) => t.done).length;
  const high  = tasks.filter((t) => t.priority === 'alta' && !t.done).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  // ── Actualizar dashboard ──
  statTotal.textContent       = total;
  statDone.textContent        = done;
  statHigh.textContent        = high;
  progressFill.style.width    = pct + '%';
  progressPct.textContent     = `${pct}% completado`;

  // ── Filtrar tareas visibles ──
  let visible = tasks.filter((t) => {
    if (filter === 'pendientes'  && t.done)  return false;
    if (filter === 'completadas' && !t.done) return false;
    if (search && !t.name.toLowerCase().includes(search)) return false;
    return true;
  });

  // ── Ordenar: pendientes por prioridad → completadas al final ──
  visible.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // ── Contador ──
  taskCount.textContent = `${visible.length} tarea${visible.length !== 1 ? 's' : ''}`;

  // ── Empty state ──
  if (!visible.length) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="icon">${
          search ? '🔍' : filter === 'completadas' ? '🎉' : '📭'
        }</div>
        <p>${
          search
            ? 'No hay tareas que coincidan con tu búsqueda.'
            : filter === 'completadas'
            ? '¡Aún no has completado ninguna tarea!'
            : 'No hay tareas aquí. ¡Agrega una!'
        }</p>
      </div>`;
    return;
  }

  // ── Renderizar tarjetas ──
  taskList.innerHTML = visible
    .map(
      (t) => `
      <div class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
        <div class="task-check" onclick="toggleDone(${t.id})">✓</div>
        <div class="task-body">
          <div class="task-name">${escapeHtml(t.name)}</div>
          <div class="task-date">${t.createdAt}</div>
        </div>
        <span class="priority-badge badge-${t.priority}">${t.priority}</span>
        <button class="delete-btn" onclick="deleteTask(${t.id})" title="Eliminar">✕</button>
      </div>`
    )
    .join('');
};

// ── Utilidad: escapar HTML para prevenir XSS ──
const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Render inicial ──
render();