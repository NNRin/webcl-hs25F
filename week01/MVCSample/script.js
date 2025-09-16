/**
 * Model, managing sites data
 */
class Model{
    todos = [];

    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [
            {id: 1, text: "Learn MVC", complete: false},
        ];
    }

    /**
     * Bind Listener to handle changes in the todo list
     */
    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback;
    }

    /**
     * Commit changes to local storage and call the listener
     * @param {Array<Object>} todos - The updated array of todos.
     */
    _commit(todos){
        this.onTodoListChanged(todos);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    addTodo(todoText){
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length -1 ].id + 1 : 1,
            text: todoText,
            complete: false,
        };
        this.todos.push(todo);
        this._commit(this.todos);
    }

    deleteTodo(id){
        this.todos = this.todos.filter(todo => todo.id !== id);
        this._commit(this.todos);
    }

    toggleTodo(id){
        this.todos = this.todos.map(todo =>
            todo.id === id ? {
                    id: todo.id,
                    text: todo.text,
                    complete: !todo.complete
                } : todo
        );
        this._commit(this.todos);
    }
}

/**
 * View handles the visual representation and the user intput
 */
class View{
    constructor(){
        this.app = document.querySelector('.todo-app')
        this.form = this.getElement('#todo-form');
        this.input = this.getElement('#todo-input');
        this.list = this.getElement('#todo-list');
        this.count = this.getElement('#todo-count');
    }

    // Helper to get an element from the Dom
    getElement(selector){
        return document.querySelector(selector);
    }

    get _todoText(){
        return this.input.value;
    }

    _resetInput(){
        this.input.value = '';
    }

    /**
     * render the entire list of todos.
     * @param {Array<Object> todos - The array of todo objects to display.}
     */
    displayTodos(todos){
        // clear existing list
        while (this.list.firstChild){
            this.list.removeChild(this.list.firstChild);
        }

        // update count of todos
        this.count.textContent = todos.length;

        // if there are no todos, display according message

        if (todos.length === 0) {
            const p = document.createElement('p');
            p.textContext = "Nothing to do! Add a task?";
            this.list.append(p);
        } else{
            // create and append a list item for each todo
            todos.forEach(todo =>{
                const li = document.createElement('li');
                li.id = todo.id;
                li.className = 'todo-item';
                if (todo.complete){
                    li.classList.add('completed');
                }

                const span = document.createElement('span');
                span.textContent = todo.text;
                span.className = 'todo-text';

                const deleteButton = document.createElement('button');
                deleteButton.className = "delete-btn";
                deleteButton.textContent = 'Delete';

                li.append(span, deleteButton);
                this.list.append(li);
            })
        }

    }

    /**
     * Binds the "add todo" functionality to the form submission.
     * @param {Function} handler - The function to call when a new todo is to be added.
     */
    bindAddTodo(handler){
        this.form.addEventListener('submit', event => {
            event.preventDefault();

            if (this._todoText) {
                handler(this._todoText);
                this._resetInput();
            }
        })
    }

    /**
     * Binds the "delete" and "toggle" functionality using event delegation.
     * We listen for clicks on the entire list and determine what was clicked.
     * @param {function} deleteHandler - The function to call when a todo is to be deleted.
     * @param {function} toggleHandler - The function to call when a todo is to be toggled.
     */
    bindEvents(deleteHandler, toggleHandler){
        this.list.addEventListener('click', event => {
            const id = parseInt(event.target.parentElement.id);
            if(event.target.className === 'delete-btn'){
                deleteHandler(id);
            }

            if(event.target.className === 'todo-text'){
                toggleHandler(id);
            }
        });
    }
}

/**
 * Connect model and the view
 */
class Controller{
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Bind handlers
        this.model.bindTodoListChanged(this.onToDoListChanged);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindEvents(this.handleDeleteTodo, this.handleToggleTodo);

        // Display initial todos
        this.onToDoListChanged(this.model.todos);
    }

        // Callback that gets triggered then the model's data changes
        onToDoListChanged = (todos) => {
            this.view.displayTodos(todos);
        }

        handleAddTodo = (todoText) => {
            this.model.addTodo(todoText);
        }

        handleDeleteTodo = (id) => {
            this.model.deleteTodo(id);
        }

        handleToggleTodo = (id) => {
            this.model.toggleTodo(id);
        }
}

const app = new Controller(new Model(), new View());

