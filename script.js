const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const darkModeToggle = document.getElementById("darkModeToggle");
const deleteSelectedBtn = document.getElementById("delete-selected");
const tip = document.getElementById("multi-select-tip");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let tooltipDismissed = localStorage.getItem("tooltipDismissed") === "true";

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Render the todo list with checkboxes and edit buttons
function renderTodos() {
  todoList.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    if (todo.completed) li.classList.add("completed");

    li.style.animationDelay = `${index * 100}ms`;
    li.style.animationName = "fadeSlideUp";
    li.addEventListener("animationend", () => {
      li.style.animationName = "";
    });

    const taskWrapper = document.createElement("div");
    taskWrapper.className = "task-item";

    // Checkbox for selecting task
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.dataset.index = index;

    checkbox.checked = false;

    // Task text span
    const span = document.createElement("span");
    span.textContent = todo.text;
    span.style.flexGrow = "1";

    // Editable input, hidden by default
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "edit-input";
    editInput.style.display = "none";
    editInput.value = todo.text;

    // Edit button always visible, icon instead of text
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.innerHTML = "✏️";

    // Edit button click toggles editing
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      span.style.display = "none";
      editInput.style.display = "inline";
      editInput.focus();
    });

    // Save edit on Enter or blur, cancel on Escape
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveEdit();
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    });

    editInput.addEventListener("blur", () => {
      saveEdit();
    });

    function saveEdit() {
      const newText = editInput.value.trim();
      if (newText) {
        todos[index].text = newText;
        saveTodos();
        renderTodos();
      } else {
        cancelEdit();
      }
    }

    function cancelEdit() {
      editInput.value = todos[index].text;
      editInput.style.display = "none";
      span.style.display = "inline";
    }

    // Clicking the list item toggles completed except on checkbox, edit button, or input
    li.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("task-checkbox") ||
        e.target.classList.contains("delete-btn") ||
        e.target.classList.contains("edit-btn") ||
        e.target === editInput
      )
        return;

      todos[index].completed = !todos[index].completed;
      saveTodos();

      // Toggle class directly instead of re-rendering full list
      if (todos[index].completed) {
        li.classList.add("completed");
      } else {
        li.classList.remove("completed");
      }

      updateTaskTracker();
    });

    // Delete button for single task
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    taskWrapper.appendChild(checkbox);
    taskWrapper.appendChild(span);
    taskWrapper.appendChild(editInput);
    taskWrapper.appendChild(editBtn);
    li.appendChild(taskWrapper);
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });

  updateTaskTracker();
  toggleBulkDeleteBtn();
  updateTooltip();
}

function updateTaskTracker() {
  const completed = todos.filter((todo) => todo.completed).length;
  const tracker = document.getElementById("task-tracker");
  tracker.textContent = `${completed} of ${todos.length} task${todos.length === 1 ? "" : "s"} completed`;
}

function updateTooltip() {
  if (todos.length >= 2 && !tooltipDismissed) {
    tip.style.display = "block";
  } else {
    tip.style.display = "none";
  }
}

function toggleBulkDeleteBtn() {
  const anyChecked = document.querySelector(".task-checkbox:checked");
  deleteSelectedBtn.style.display = anyChecked ? "block" : "none";
}

todoList.addEventListener("change", (e) => {
  if (e.target.classList.contains("task-checkbox")) {
    toggleBulkDeleteBtn();
    if (tip) tip.style.display = "none";
  }
});

deleteSelectedBtn.addEventListener("click", () => {
  const checkedBoxes = document.querySelectorAll(".task-checkbox:checked");
  const indexesToDelete = Array.from(checkedBoxes).map((cb) => +cb.dataset.index);

  indexesToDelete.sort((a, b) => b - a).forEach((i) => todos.splice(i, 1));

  saveTodos();
  renderTodos();
});

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text === "") return;
  todos.push({ text, completed: false });
  todoInput.value = "";
  saveTodos();
  renderTodos();
});

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
  }
});

const dismissBtn = document.getElementById("dismiss-tip");
if (dismissBtn) {
  dismissBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    tip.style.display = "none";
    tooltipDismissed = true;
    localStorage.setItem("tooltipDismissed", "true");
  });
}

renderTodos();
