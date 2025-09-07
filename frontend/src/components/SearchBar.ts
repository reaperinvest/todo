export function SearchBar({ value, onChange, onClear, suggestions }: { value: string; onChange: (v: string) => void; onClear: () => void; suggestions: string[] }) {
  return React.createElement('section', { className: 'card p-4 mb-6', 'aria-labelledby': 'search-title' },
    React.createElement('h2', { id: 'search-title', className: 'sr-only' }, 'Search todos'),
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('label', { htmlFor: 'searchInput', className: 'sr-only' }, 'Search'),
      React.createElement('input', { id: 'searchInput', className: 'input flex-1', placeholder: 'Search tasks...', autoComplete: 'off', list: 'searchSuggestions', value, onChange: (e: any) => onChange(e.target.value) }),
      React.createElement('button', { id: 'clearSearch', className: 'btn-ghost', type: 'button', 'aria-label': 'Clear search', onClick: onClear }, 'Clear')
    ),
    React.createElement('datalist', { id: 'searchSuggestions' }, suggestions.map((s) => React.createElement('option', { key: s, value: s })))
  );
}

