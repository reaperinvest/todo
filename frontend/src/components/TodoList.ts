import { TodoItem } from './TodoItem.js';

export function TodoList({ title, items, emptyText, hidden, editingId, onToggle, onDelete, onStartEdit, onCommitEdit, onCancelEdit, onChangePriority }: {
  title: string;
  items: { id: string; text: string; completed: boolean; priority: 'low'|'medium'|'high' }[];
  emptyText: string;
  hidden: boolean;
  editingId: string | null;
  onToggle: (id: string, completed: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onStartEdit: (id: string) => void;
  onCommitEdit: (text: string) => void | Promise<void>;
  onCancelEdit: () => void;
  onChangePriority: (id: string, priority: 'low'|'medium'|'high') => void | Promise<void>;
}) {
  return React.createElement('section', { className: 'card', 'aria-labelledby': `${title.toLowerCase()}-heading`, style: { display: hidden ? 'none' : '' } },
    React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-slate-700/60' },
      React.createElement('h2', { id: `${title.toLowerCase()}-heading`, className: 'text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400' }, title)
    ),
    React.createElement('ul', { role: 'list', className: 'divide-y divide-slate-200/70 dark:divide-slate-700/60' },
      items.map((t) => React.createElement(TodoItem, {
        key: t.id, todo: t, editing: editingId === t.id,
        onToggle, onDelete,
        onStartEdit: () => onStartEdit(t.id),
        onCommitEdit,
        onCancelEdit,
        onChangePriority
      }))
    ),
    items.length === 0 && React.createElement('div', { className: 'px-4 py-6 text-center text-slate-500' }, emptyText)
  );
}

