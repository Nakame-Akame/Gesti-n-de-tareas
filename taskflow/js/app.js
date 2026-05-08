// ==========================
// TASKFLOW APP COMPLETO
// ==========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filter-btn");

const statTotal = document.getElementById("statTotal");
const statDone = document.getElementById("statDone");
const statHigh = document.getElementById("statHigh");

const progressFill = document.getElementById("progressFill");
const progressPct = document.getElementById("progressPct");

const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");

let currentFilter = "todas";

// ==========================
// GUARDAR LOCALSTORAGE
// ==========================
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ==========================
// AGREGAR TAREA
// ==========================
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const priority = document.getElementById("prioritySelect").value;

  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
    priority,
  };

  tasks.push(newTask);
  taskInput.value = "";

  saveTasks();
  renderTasks();
});

// ENTER PARA AGREGAR
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

// ==========================
// CAMBIAR ESTADO COMPLETADO
// ==========================
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

// ==========================
// ELIMINAR
// ==========================
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// ==========================
// EDITAR (INLINE)
// ==========================
function editTask(id, oldText, li) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;
  input.className = "edit-input";

  li.innerHTML = "";
  li.appendChild(input);
  input.focus();

  const saveEdit = () => {
    const newText = input.value.trim();
    if (newText) {
      tasks = tasks.map(task =>
        task.id === id ? { ...task, text: newText } : task
      );

      saveTasks();
      renderTasks();
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit();
  });

  input.addEventListener("blur", saveEdit);
}

// ==========================
// FILTRAR
// ==========================
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ==========================
// BUSCAR
// ==========================
searchInput.addEventListener("input", renderTasks);

// ==========================
// RENDER
// ==========================
function renderTasks() {
  const search = searchInput.value.toLowerCase();

  let filtered = tasks.filter(task => {
    const matchSearch = task.text.toLowerCase().includes(search);

    if (currentFilter === "pendientes") return !task.completed && matchSearch;
    if (currentFilter === "completadas") return task.completed && matchSearch;

    return matchSearch;
  });

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  filtered.forEach(task => {
    const li = document.createElement("div");
    li.className = `task-item ${task.priority}`;
    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""} />
        <span class="${task.completed ? "done" : ""}">${task.text}</span>
      </div>

      <div class="task-actions">
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;

    // completar
    li.querySelector("input").addEventListener("change", () => {
      toggleTask(task.id);
    });

    // eliminar
    li.querySelector(".delete").addEventListener("click", () => {
      deleteTask(task.id);
    });

    // editar
    li.querySelector(".edit").addEventListener("click", () => {
      editTask(task.id, task.text, li);
    });

    // doble click para editar también
    li.querySelector("span").addEventListener("dblclick", () => {
      editTask(task.id, task.text, li);
    });

    taskList.appendChild(li);
  });

  updateStats();
}

// ==========================
// ESTADÍSTICAS + PROGRESO
// ==========================
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const high = tasks.filter(t => t.priority === "alta").length;

  statTotal.textContent = total;
  statDone.textContent = done;
  statHigh.textContent = high;

  taskCount.textContent = `${total} tareas`;

  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  progressFill.style.width = `${progress}%`;
  progressPct.textContent = `${progress}%`;
}

// ==========================
// INICIO
// ==========================
renderTasks();