function Progress({ total, completed }: { total: number; completed: number }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const status = `Completed ${completed} of ${total} (${percent}%)`;
  React.useEffect(() => {
    const bar = document.getElementById('dashProgress');
    if (!bar) return;
    const parent = bar.parentElement;
    (bar as HTMLElement).style.width = `${percent}%`;
    if (parent) {
      parent.setAttribute('aria-valuenow', String(percent));
      parent.setAttribute('aria-valuetext', status);
    }
  }, [total, completed]);
  return React.createElement('div', { className: 'flex-1 min-w-[220px]' },
    React.createElement('div', { className: 'flex items-center justify-between mb-1' },
      React.createElement('div', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Progress'),
      React.createElement('div', { id: 'dashPercent', className: 'text-xs font-medium' }, status)
    ),
    React.createElement('div', {
      className: 'h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-700/60',
      role: 'progressbar', 'aria-label': 'Completed percentage', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': percent
    }, React.createElement('div', { id: 'dashProgress', className: 'h-2 rounded-full bg-indigo-600 dark:bg-emerald-500', style: { width: `${percent}%` } }))
  );
}

export function Dashboard({ total, completed, error }: { total: number; completed: number; error: string }) {
  return React.createElement('section', { id: 'dashboard', className: 'card p-4 mb-6', 'aria-labelledby': 'dashboard-title' },
    React.createElement('h2', { id: 'dashboard-title', className: 'text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3' }, 'Dashboard'),
    !!error && React.createElement('div', { id: 'globalError', className: 'mb-3 text-sm px-3 py-2 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-800/40 dark:text-rose-200', role: 'alert' }, error),
    React.createElement('div', { className: 'flex flex-wrap items-center gap-3' },
      React.createElement('div', { className: 'rounded-lg px-4 py-3 border border-slate-200/70 dark:border-slate-700/60' },
        React.createElement('div', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Total tasks'),
        React.createElement('div', { id: 'dashTotal', className: 'text-xl font-semibold' }, String(total))
      ),
      React.createElement('div', { className: 'rounded-lg px-4 py-3 border border-slate-200/70 dark:border-slate-700/60' },
        React.createElement('div', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Completed'),
        React.createElement('div', { id: 'dashCompleted', className: 'text-xl font-semibold' }, String(completed))
      ),
      React.createElement(Progress, { total, completed })
    )
  );
}

