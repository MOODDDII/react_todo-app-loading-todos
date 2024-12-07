import React, { useEffect, useState } from 'react';
import { getTodos } from './api/todos';
import { Todo } from './types/Todo';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTodos()
      .then(loadedTodos => {
        setTodos(loadedTodos);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 3000);
  };

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      {/* Error notification for user interactions */}
      {error && (
        <div
          data-cy="ErrorNotification"
          className="notification is-danger is-light has-text-weight-normal"
        >
          <button
            data-cy="HideErrorButton"
            type="button"
            className="delete"
            onClick={() => setError('')}
          />
          {error}
        </div>
      )}

      <div className="todoapp__content">
        {/* Show loader or empty state if todos are not yet loaded */}
        {isLoading ? (
          <div className="loader" data-cy="Loader">
            Loading...
          </div>
        ) : todos.length === 0 ? (
          <p className="todoapp__empty-message" data-cy="EmptyMessage">
            No todos available. Add one!
          </p>
        ) : (
          <>
            <header className="todoapp__header">
              <button
                type="button"
                className="todoapp__toggle-all"
                data-cy="ToggleAllButton"
                onClick={() => {
                  const areAllCompleted = todos.every(todo => todo.completed);
                  const updatedTodos = todos.map(todo => ({
                    ...todo,
                    completed: !areAllCompleted,
                  }));
                  setTodos(updatedTodos);
                }}
              />
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const input = e.currentTarget.querySelector(
                    'input'
                  ) as HTMLInputElement;
                  const title = input.value.trim();

                  if (title) {
                    const newTodo = {
                      id: Date.now(),
                      userId: USER_ID,
                      title,
                      completed: false,
                    };
                    setTodos([...todos, newTodo]);
                    input.value = '';
                  } else {
                    showError('Title should not be empty');
                  }
                }}
              >
                <input
                  data-cy="NewTodoField"
                  type="text"
                  className="todoapp__new-todo"
                  placeholder="What needs to be done?"
                />
              </form>
            </header>

            <section className="todoapp__main" data-cy="TodoList">
              {filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  data-cy="Todo"
                  className={`todo ${todo.completed ? 'completed' : ''}`}
                >
                  <label className="todo__status-label">
                    <input
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      checked={todo.completed}
                      onChange={() => {
                        setTodos(
                          todos.map(t =>
                            t.id === todo.id
                              ? { ...t, completed: !t.completed }
                              : t
                          )
                        );
                      }}
                    />
                  </label>

                  <span data-cy="TodoTitle" className="todo__title">
                    {todo.title}
                  </span>

                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                    onClick={() => {
                      setTodos(todos.filter(t => t.id !== todo.id));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </section>

            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {todos.filter(todo => !todo.completed).length} items left
              </span>
              <nav className="filter" data-cy="Filter">
                <a
                  href="#/"
                  className={`filter__link ${
                    filter === 'all' ? 'selected' : ''
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All
                </a>
                <a
                  href="#/active"
                  className={`filter__link ${
                    filter === 'active' ? 'selected' : ''
                  }`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </a>
                <a
                  href="#/completed"
                  className={`filter__link ${
                    filter === 'completed' ? 'selected' : ''
                  }`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </a>
              </nav>
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                onClick={() => {
                  setTodos(todos.filter(todo => !todo.completed));
                }}
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
