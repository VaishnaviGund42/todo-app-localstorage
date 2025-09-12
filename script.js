// app.js
const STORAGE_KEY = 'todo_app_v1';

let todos = [];            // in-memory array of todo objects
let currentFilter = 'all'; // 'all' | 'active' | 'completed'

/* ---------- DOM elements ---------- */
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const listEl = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const filters = document.querySelectorAll('.filter');
const clearCompletedBtn = document.getElementById('clear-completed');

/* ---------- Load from localStorage on startup ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  render();
});

/* ---------- Form submit -> add todo ---------- */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
});

/* ---------- Filter buttons ---------- */
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

/* ---------- Clear completed ---------- */
clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
});

/* ---------- Functions: load/save ---------- */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse todos from localStorage', err);
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/* ---------- Add, toggle, delete, edit ---------- */
function addTodo(text) {
  const todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.unshift(todo); // newest on top
  saveTodos();
  render();
}

function toggleTodo(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(x => x.id !== id);
  saveTodos();
  render();
}

function updateTodoText(id, newText) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.text = newText.trim();
  saveTodos();
  render();
}

/* ---------- Render UI ---------- */
function render() {
  listEl.innerHTML = '';

  // apply filter
  const visible = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  // create DOM for each visible todo
  visible.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    // checkbox
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = todo.completed;
    cb.addEventListener('change', () => toggleTodo(todo.id));

    // text (editable)
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = todo.text;
    textSpan.tabIndex = 0;

    // double click to edit
    textSpan.addEventListener('dblclick', () => beginEdit(li, todo));

    // edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'icon edit';
    editBtn.title = 'Edit';
    editBtn.innerHTML = '✎';
    editBtn.addEventListener('click', () => beginEdit(li, todo));

    // delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'icon delete';
    delBtn.title = 'Delete';
    delBtn.innerHTML = '✕';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this task?')) deleteTodo(todo.id);
    });

    li.appendChild(cb);
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });

  // remaining count
  const remaining = todos.filter(t => !t.completed).length;
  remainingCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} left`;
}

/* ---------- Inline editing ---------- */
function beginEdit(li, todo) {
  // prevent multiple editors
  if (li.querySelector('input.edit-input')) return;

  const textSpan = li.querySelector('.text');
  const editInput = document.createElement('input');
  editInput.className = 'edit-input';
  editInput.type = 'text';
  editInput.value = todo.text;
  editInput.style.flex = '1';
  li.replaceChild(editInput, textSpan);
  editInput.focus();
  // save on blur or Enter
  const finish = () => {
    const newText = editInput.value.trim();
    if (newText.length === 0) {
      // if user leaves text empty, delete the todo
      deleteTodo(todo.id);
    } else {
      updateTodoText(todo.id, newText);
    }
  };
  editInput.addEventListener('blur', finish);
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { editInput.blur(); }
    if (e.key === 'Escape') { render(); } // cancel
  });
}
