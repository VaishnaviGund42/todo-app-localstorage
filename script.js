
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');
        const todoList = document.getElementById('todo-list');

        let todos = JSON.parse(localStorage.getItem('todos')) || [];

        function saveTodos() {
            localStorage.setItem('todos', JSON.stringify(todos));
        }

        function renderTodos() {
            todoList.innerHTML = '';
            todos.forEach((todo, idx) => {
                const li = document.createElement('li');
                li.className = 'todo-item' + (todo.completed ? ' completed' : '');
                li.innerHTML = `
                    <span class="todo-text">${todo.text}</span>
                    <div class="actions">
                        <button class="complete-btn" title="Mark as done">&#10003;</button>
                        <button class="delete-btn" title="Delete">&#10005;</button>
                    </div>
                `;
                // Complete button
                li.querySelector('.complete-btn').onclick = () => {
                    todos[idx].completed = !todos[idx].completed;
                    saveTodos();
                    renderTodos();
                };
                // Delete button
                li.querySelector('.delete-btn').onclick = () => {
                    todos.splice(idx, 1);
                    saveTodos();
                    renderTodos();
                };
                todoList.appendChild(li);
            });
        }

        todoForm.onsubmit = e => {
            e.preventDefault();
            const text = todoInput.value.trim();
            if (text) {
                todos.unshift({ text, completed: false });
                saveTodos();
                renderTodos();
                todoInput.value = '';
            }
        };

        // Initial render
        renderTodos();

