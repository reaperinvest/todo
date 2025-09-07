export function TodoItem({ todo, editing, onToggle, onDelete, onStartEdit, onCommitEdit, onCancelEdit, onChangePriority }: {
  todo: { id: string; text: string; completed: boolean; priority: 'low'|'medium'|'high' };
  editing: boolean;
  onToggle: (id: string, completed: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onStartEdit: () => void;
  onCommitEdit: (text: string) => void | Promise<void>;
  onCancelEdit: () => void;
  onChangePriority: (id: string, priority: 'low'|'medium'|'high') => void | Promise<void>;
}) {
  function PriorityBadge({ priority }: { priority: 'low'|'medium'|'high' }) {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    const map = {
      low: ' bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
      medium: ' bg-indigo-100 text-indigo-700 dark:bg-indigo-700/50 dark:text-indigo-200',
      high: ' bg-rose-100 text-rose-700 dark:bg-rose-700/50 dark:text-rose-200',
    } as const;
    const text = priority[0].toUpperCase() + priority.slice(1);
    return React.createElement('span', { className: base + map[priority], 'aria-label': `Priority ${priority}` }, text);
  }

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (editing && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [editing]);

  return React.createElement('li', { 'data-id': todo.id, role: 'listitem', className: 'flex items-center gap-3 px-4 py-3' },
    React.createElement('input', {
      type: 'checkbox', className: 'checkbox', checked: todo.completed,
      'aria-label': 'Toggle complete', onChange: (e: any) => onToggle(todo.id, e.target.checked)
    }),
    React.createElement(PriorityBadge, { priority: todo.priority }),
    editing
      ? React.createElement('input', {
          ref: inputRef, defaultValue: todo.text, 'data-editor': 'true', className: 'input py-1 px-2 flex-1',
          onKeyDown: (e: any) => {
            if (e.key === 'Escape') onCancelEdit();
            if (e.key === 'Enter') onCommitEdit(e.target.value.trim());
          },
          onBlur: (e: any) => onCommitEdit(e.target.value.trim())
        })
      : React.createElement('span', {
          className: 'flex-1 text-slate-800 dark:text-slate-100 ' + (todo.completed ? 'line-through text-slate-400' : ''),
          'data-role': 'text'
        }, todo.text),
    React.createElement('div', { className: 'ml-auto flex items-center gap-1' },
      React.createElement('select', {
        className: 'input w-28 py-1 px-2 text-xs', 'aria-label': 'Change priority',
        value: todo.priority, onChange: (e: any) => onChangePriority(todo.id, e.target.value)
      }, ['low','medium','high'].map(p => React.createElement('option', { key: p, value: p }, p[0].toUpperCase() + p.slice(1)))),
      editing
        ? React.createElement('button', { className: 'btn-ghost text-xs px-2 py-1', onClick: onCancelEdit }, 'Cancel')
        : React.createElement('button', { className: 'btn-ghost text-xs px-2 py-1', onClick: onStartEdit, 'data-action': 'edit', 'aria-label': 'Edit todo' }, 'Edit'),
      React.createElement('button', { className: 'btn-ghost text-xs px-2 py-1 text-rose-600 hover:text-rose-700', onClick: () => onDelete(todo.id), 'data-action': 'delete', 'aria-label': 'Delete todo' }, 'Delete')
    )
  );
}

