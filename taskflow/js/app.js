// ============================================
// TaskFlow — app.js
// ============================================

// ============================================
// ESTADO GLOBAL
// ============================================

let tasks =
  JSON.parse(
    localStorage.getItem('taskflow_tasks')
  ) || [];

let currentFilter = 'todas';
let currentSearch = '';

// ============================================
// REFERENCIAS DEL DOM
// ============================================

const taskInput =
  document.getElementById('taskInput');

const prioritySelect =
  document.getElementById('prioritySelect');

const addBtn =
  document.getElementById('addBtn');

const searchInput =
  document.getElementById('searchInput');

const taskList =
  document.getElementById('taskList');

const taskCount =
  document.getElementById('taskCount');

const statTotal =
  document.getElementById('statTotal');

const statDone =
  document.getElementById('statDone');

const statHigh =
  document.getElementById('statHigh');

const progressFill =
  document.getElementById('progressFill');

const progressPct =
  document.getElementById('progressPct');

const themeBtn =
  document.getElementById('themeBtn');

const filterBtns =
  document.querySelectorAll('.filter-btn');

// ============================================
// LOCAL STORAGE
// ============================================

const saveTasks = () => {
  localStorage.setItem(
    'taskflow_tasks',
    JSON.stringify(tasks)
  );
};

// ============================================
// TEMA CLARO / OSCURO
// ============================================

const savedTheme =
  localStorage.getItem('taskflow_theme') || 'dark';

document.documentElement.setAttribute(
  'data-theme',
  savedTheme
);

themeBtn.textContent =
  savedTheme === 'dark'
    ? '☀️'
    : '🌙';

themeBtn.addEventListener('click', () => {

  const currentTheme =
    document.documentElement.getAttribute(
      'data-theme'
    );

  const newTheme =
    currentTheme === 'dark'
      ? 'light'
      : 'dark';

  document.documentElement.setAttribute(
    'data-theme',
    newTheme
  );

  localStorage.setItem(
    'taskflow_theme',
    newTheme
  );

  themeBtn.textContent =
    newTheme === 'dark'
      ? '☀️'
      : '🌙';
});

// ============================================
// AGREGAR TAREA
// ============================================

const addTask = () => {

  const taskName =
    taskInput.value.trim();

  // VALIDACIÓN

  if (!taskName) {

    taskInput.focus();

    taskInput.style.borderColor =
      'var(--high)';

    setTimeout(() => {
      taskInput.style.borderColor = '';
    }, 800);

    return;
  }

  // NUEVA TAREA

  const task = {

    id: Date.now(),

    name: taskName,

    priority: prioritySelect.value,

    done: false,

    createdAt:
      new Date().toLocaleDateString(
        'es-PE',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      )
  };

  // AGREGAR AL ARRAY

  tasks.unshift(task);

  saveTasks();

  taskInput.value = '';

  taskInput.focus();

  renderTasks();
};

// ============================================
// EVENTOS AGREGAR
// ============================================

addBtn.addEventListener(
  'click',
  addTask
);

taskInput.addEventListener(
  'keydown',
  (e) => {

    if (e.key === 'Enter') {
      addTask();
    }
  }
);

// ============================================
// COMPLETAR TAREA
// ============================================

const toggleDone = (id) => {

  const task =
    tasks.find(
      (task) => task.id === id
    );

  if (!task) return;

  task.done = !task.done;

  saveTasks();

  renderTasks();
};

// ============================================
// ELIMINAR TAREA
// ============================================

const deleteTask = (id) => {

  const element =
    document.querySelector(
      `[data-id="${id}"]`
    );

  if (!element) return;

  element.classList.add('removing');

  setTimeout(() => {

    tasks =
      tasks.filter(
        (task) => task.id !== id
      );

    saveTasks();

    renderTasks();

  }, 200);
};

// ============================================
// FILTROS
// ============================================

filterBtns.forEach((btn) => {

  btn.addEventListener('click', () => {

    currentFilter =
      btn.dataset.filter;

    filterBtns.forEach((button) => {

      button.classList.remove('active');

    });

    btn.classList.add('active');

    renderTasks();
  });
});

// ============================================
// BUSCADOR
// ============================================

searchInput.addEventListener(
  'input',
  () => {

    currentSearch =
      searchInput.value.toLowerCase();

    renderTasks();
  }
);

// ============================================
// ESCAPAR HTML (SEGURIDAD)
// ============================================

const escapeHtml = (text) => {

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// ============================================
// ORDEN PRIORIDAD
// ============================================

const priorityOrder = {
  alta: 0,
  media: 1,
  baja: 2
};

// ============================================
// RENDER PRINCIPAL
// ============================================

const renderTasks = () => {

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const total =
    tasks.length;

  const completed =
    tasks.filter(
      (task) => task.done
    ).length;

  const urgent =
    tasks.filter(
      (task) =>
        task.priority === 'alta' &&
        !task.done
    ).length;

  const progress =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  // ==========================================
  // ACTUALIZAR UI
  // ==========================================

  statTotal.textContent = total;

  statDone.textContent = completed;

  statHigh.textContent = urgent;

  progressFill.style.width =
    `${progress}%`;

  progressPct.textContent =
    `${progress}% completado`;

  // ==========================================
  // FILTRAR TAREAS
  // ==========================================

  let visibleTasks =
    tasks.filter((task) => {

      if (
        currentFilter === 'pendientes' &&
        task.done
      ) {
        return false;
      }

      if (
        currentFilter === 'completadas' &&
        !task.done
      ) {
        return false;
      }

      if (
        currentSearch &&
        !task.name
          .toLowerCase()
          .includes(currentSearch)
      ) {
        return false;
      }

      return true;
    });

  // ==========================================
  // ORDENAR
  // ==========================================

  visibleTasks.sort((a, b) => {

    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    return (
      priorityOrder[a.priority] -
      priorityOrder[b.priority]
    );
  });

  // ==========================================
  // CONTADOR
  // ==========================================

  taskCount.textContent =
    `${visibleTasks.length} tarea${
      visibleTasks.length !== 1
        ? 's'
        : ''
    }`;

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (!visibleTasks.length) {

    taskList.innerHTML = `
      <div class="empty-state">

        <div class="icon">
          ${
            currentSearch
              ? '🔍'
              : currentFilter === 'completadas'
              ? '🎉'
              : '📭'
          }
        </div>

        <p>
          ${
            currentSearch
              ? 'No se encontraron tareas.'
              : currentFilter === 'completadas'
              ? 'Aún no completas tareas.'
              : 'No hay tareas disponibles.'
          }
        </p>

      </div>
    `;

    return;
  }

  // ==========================================
  // RENDER TARJETAS
  // ==========================================

  taskList.innerHTML =
    visibleTasks
      .map((task) => {

        return `
          <article
            class="task-item ${
              task.done ? 'done' : ''
            }"
            data-id="${task.id}"
          >

            <button
              class="task-check"
              onclick="toggleDone(${task.id})"
            >
              ✓
            </button>

            <div class="task-body">

              <h3 class="task-name">
                ${escapeHtml(task.name)}
              </h3>

              <p class="task-date">
                ${task.createdAt}
              </p>

            </div>

            <span
              class="
                priority-badge
                badge-${task.priority}
              "
            >
              ${task.priority}
            </span>

            <button
              class="delete-btn"
              onclick="deleteTask(${task.id})"
              title="Eliminar tarea"
            >
              ✕
            </button>

          </article>
        `;
      })
      .join('');
};

// ============================================
// HACER FUNCIONES GLOBALES
// ============================================

window.toggleDone = toggleDone;
window.deleteTask = deleteTask;

// ============================================
// RENDER INICIAL
// ============================================

renderTasks();