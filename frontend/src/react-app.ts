import { createRepository, type Todo } from './data/repository.js';
import { Header } from './components/Header.js';
import { Dashboard } from './components/Dashboard.js';
import { SearchBar } from './components/SearchBar.js';
import { TodoList } from './components/TodoList.js';

const { useState, useEffect, useMemo } = React;

function useTheme(): [boolean, (v: boolean) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme-preference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved ?? (prefersDark ? 'dark' : 'light');
    return theme === 'dark';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
  }, [isDark]);
  return [isDark, setIsDark];
}

function App() {
  const repo = useMemo(() => createRepository(), []);
  const [isDark, setIsDark] = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all'|'active'|'completed'>('all');
  const [search, setSearch] = useState<string>('');
  const [editingId, setEditingId] = useState<string|null>(null);
  const [formText, setFormText] = useState<string>('');
  const [formPriority, setFormPriority] = useState<'low'|'medium'|'high'>('medium');

  const filtered = useMemo(() => {
    const matches = (t: Todo) => search === '' ? true : t.text.toLowerCase().includes(search.toLowerCase());
    const list = todos.filter(matches);
    if (filter === 'active') return list.filter(t => !t.completed);
    if (filter === 'completed') return list.filter(t => t.completed);
    return list;
  }, [todos, filter, search]);

  const activeList = filtered.filter(t => !t.completed);
  const completedList = filtered.filter(t => t.completed);

  const dashTotal = todos.length;
  const dashCompleted = todos.filter(t => t.completed).length;

  const suggestions = useMemo(() => {
    const q = search.toLowerCase();
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of todos) {
      const text = t.text.trim();
      const lower = text.toLowerCase();
      if ((q === '' || lower.includes(q)) && !seen.has(lower)) {
        seen.add(lower);
        out.push(text);
        if (out.length >= 10) break;
      }
    }
    return out;
  }, [todos, search]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await repo.list();
        if (!alive) return;
        setTodos(list);
      } catch (e) {
        setError('Failed to load todos.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [repo]);

  const addTodo = async (e: Event) => {
    e.preventDefault();
    const text = formText.trim();
    if (!text) return;
    try {
      await repo.add(text, formPriority);
      setFormText('');
      const list = await repo.list();
      setTodos(list);
    } catch (e) { setError('Failed to add todo.'); }
  };

  const toggle = async (id: string, completed: boolean) => {
    try { await repo.update(id, { completed }); setTodos(await repo.list()); }
    catch { setError('Failed to update todo.'); }
  };
  const remove = async (id: string) => {
    try { await repo.delete(id); setTodos(await repo.list()); }
    catch { setError('Failed to delete todo.'); }
  };
  const changePriority = async (id: string, priority: 'low'|'medium'|'high') => {
    try { await repo.update(id, { priority }); setTodos(await repo.list()); }
    catch { setError('Failed to change priority.'); }
  };
  const clearCompleted = async () => {
    try { await repo.clearCompleted(); setTodos(await repo.list()); }
    catch { setError('Failed to clear completed.'); }
  };
  const commitEdit = async (text: string) => {
    const t = text.trim();
    if (!editingId) return setEditingId(null);
    if (!t) { setEditingId(null); return; }
    try {
      await repo.update(editingId, { text: t });
      setEditingId(null);
      setTodos(await repo.list());
    } catch { setError('Failed to save changes.'); }
  };

  return React.createElement('div', { className: 'mx-auto max-w-2xl px-4 py-8' },
    React.createElement(Header, { isDark, onToggleTheme: () => setIsDark(!isDark) }),
    React.createElement(Dashboard, { total: dashTotal, completed: dashCompleted, error }),
    React.createElement(SearchBar, { value: search, onChange: setSearch, onClear: () => setSearch(''), suggestions }),

    React.createElement('section', { className: 'card p-4 mb-6', 'aria-labelledby': 'add-todo-title' },
      React.createElement('h2', { id: 'add-todo-title', className: 'sr-only' }, 'Add a new todo'),
      React.createElement('form', { id: 'todoForm', className: 'flex items-start gap-3', noValidate: true, onSubmit: addTodo as any },
        React.createElement('label', { htmlFor: 'todoInput', className: 'sr-only' }, 'Todo'),
        React.createElement('input', { id: 'todoInput', name: 'todo', className: 'input flex-1', placeholder: 'Add a new task…', autoComplete: 'off', required: true, maxLength: 200, value: formText, onChange: (e: any) => setFormText(e.target.value) }),
        React.createElement('label', { htmlFor: 'prioritySelect', className: 'sr-only' }, 'Priority'),
        React.createElement('select', { id: 'prioritySelect', name: 'priority', className: 'input w-32', 'aria-label': 'Priority', value: formPriority, onChange: (e: any) => setFormPriority(e.target.value) },
          React.createElement('option', { value: 'low' }, 'Low'),
          React.createElement('option', { value: 'medium' }, 'Medium'),
          React.createElement('option', { value: 'high' }, 'High')
        ),
        React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Add')
      )
    ),

    React.createElement('section', { className: 'mb-4 flex flex-wrap items-center justify-between gap-3' },
      React.createElement('div', { role: 'tablist', 'aria-label': 'Filter todos', className: 'flex items-center gap-2' },
        ['all','active','completed'].map((f) => React.createElement('button', {
          key: f, className: 'btn-ghost', 'data-filter': f, 'aria-selected': filter === f ? 'true' : 'false', onClick: () => setFilter(f as any)
        }, (f as string)[0].toUpperCase() + (f as string).slice(1)))
      ),
      React.createElement('div', { className: 'flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300' },
        React.createElement('span', { id: 'todoCount', 'aria-live': 'polite' }, `${todos.filter(t=>!t.completed).length}/${todos.length} ${todos.length===1?'item':'items'}`),
        React.createElement('button', { id: 'clearCompleted', className: 'btn-ghost', onClick: clearCompleted }, 'Clear completed')
      )
    ),

    loading && React.createElement('div', { id: 'loading', className: 'card p-6 mb-4' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', { className: 'h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500' }),
        React.createElement('p', { className: 'text-sm' }, 'Loading your todos…')
      )
    ),

    React.createElement('main', { className: 'space-y-6', 'aria-live': 'polite' },
      React.createElement(TodoList, {
        title: 'Active', items: activeList, emptyText: 'No active tasks', hidden: filter === 'completed', editingId,
        onToggle: toggle, onDelete: remove, onStartEdit: setEditingId, onCommitEdit: commitEdit, onCancelEdit: () => setEditingId(null), onChangePriority: changePriority
      }),
      React.createElement(TodoList, {
        title: 'Completed', items: completedList, emptyText: 'No completed tasks', hidden: filter === 'active', editingId,
        onToggle: toggle, onDelete: remove, onStartEdit: setEditingId, onCommitEdit: commitEdit, onCancelEdit: () => setEditingId(null), onChangePriority: changePriority
      })
    )
  );
}

function mount() {
  const container = document.getElementById('app')!;
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
}

document.title = 'Todo - TailwindCSS (React + TS)';

async function bootstrap() {
  try {
    const hasPref = !!localStorage.getItem('data-source');
    const wantsAuto = localStorage.getItem('data-source') === 'auto';
    if (!hasPref || wantsAuto) {
      const base = localStorage.getItem('api-base') || 'http://localhost:4000';
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 800);
      try {
        const res = await fetch(`${base}/api/health`, { signal: ctrl.signal });
        if (res.ok) {
          localStorage.setItem('data-source', 'api');
          localStorage.setItem('api-base', base);
        } else {
          localStorage.setItem('data-source', 'local');
        }
      } catch {
        localStorage.setItem('data-source', 'local');
      } finally {
        clearTimeout(timer);
      }
    }
  } catch {}
  mount();
}

bootstrap();
