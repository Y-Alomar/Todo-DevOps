import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // API base URL - change this to your Flask backend URL
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch todos. Make sure Flask backend is running.');
      console.error(err);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          description: description,
          completed: false
        })
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setTitle('');
        setDescription('');
        setError('');
      }
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });

      if (response.ok) {
        setTodos(todos.map(todo =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        ));
        setError('');
      }
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
        setError('');
      }
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="app-title">Todo List</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Add Todo Form */}
        <div className="add-todo-form">
          <input
            type="text"
            placeholder="Todo title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo(e)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo(e)}
            className="input-field"
          />
          <button onClick={addTodo} className="add-button">
            Add Todo
          </button>
        </div>

        {/* Todo List */}
        <div className="todo-list">
          {todos.length === 0 ? (
            <p className="empty-state">
              No todos yet. Add one above!
            </p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className="todo-item">
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    className="todo-checkbox"
                  />
                  <div className="todo-text">
                    <h3 className={todo.completed ? 'completed' : ''}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={todo.completed ? 'completed' : ''}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;