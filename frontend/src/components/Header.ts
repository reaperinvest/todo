export function Header({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  return React.createElement('header', { className: 'mb-6 flex items-center justify-between' },
    React.createElement('div', null,
      React.createElement('h1', { className: 'text-3xl font-bold tracking-tight' }, 'Todo'),
      React.createElement('p', { className: 'text-sm text-slate-500 dark:text-slate-400' }, 'Organize tasks. Fast, accessible, responsive.')
    ),
    React.createElement('div', { className: 'flex items-center gap-2' },
      React.createElement('button', { id: 'themeToggle', className: 'btn-ghost', 'aria-label': 'Toggle dark mode', onClick: onToggleTheme },
        React.createElement('span', { className: 'sr-only' }, 'Toggle theme'), isDark ? '🌙' : '☀️'
      )
    )
  );
}

