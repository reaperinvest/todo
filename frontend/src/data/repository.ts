export type Priority = 'low' | 'medium' | 'high';
export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
};

export type TodoRepository = {
  list: () => Promise<Todo[]>;
  add: (text: string, priority: Priority) => Promise<Todo>;
  update: (id: string, patch: Partial<Pick<Todo, 'text' | 'completed' | 'priority'>>) => Promise<Todo>;
  delete: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
};

const STORAGE_KEY = 'todo-items-v1';

export function createRepository(): TodoRepository {
  const source = (localStorage.getItem('data-source') || 'local').toLowerCase();
  const apiBase = localStorage.getItem('api-base') || 'http://localhost:4000';
  if (source === 'api') return httpRepository(apiBase);
  return localRepository();
}

function isValidPriority(p: any): p is Priority {
  return p === 'low' || p === 'medium' || p === 'high';
}

function localRepository(): TodoRepository {
  const read = (): Todo[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr.map((t: any) => ({ priority: isValidPriority(t?.priority) ? t.priority : 'medium', ...t })) as Todo[];
    } catch {
      return [];
    }
  };
  const write = (arr: Todo[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  return {
    async list() {
      return read();
    },
    async add(text, priority) {
      const now = Date.now();
      const todo: Todo = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        completed: false,
        priority: isValidPriority(priority) ? priority : 'medium',
        createdAt: now,
        updatedAt: now,
      };
      const arr = read();
      arr.unshift(todo);
      write(arr);
      return todo;
    },
    async update(id, patch) {
      const arr = read();
      const t = arr.find((x) => x.id === id);
      if (!t) throw new Error('not found');
      if (typeof patch.text === 'string') t.text = patch.text;
      if (typeof patch.completed === 'boolean') t.completed = patch.completed;
      if (isValidPriority((patch as any).priority)) t.priority = (patch as any).priority;
      t.updatedAt = Date.now();
      write(arr);
      return t;
    },
    async delete(id) {
      const arr = read().filter((t) => t.id !== id);
      write(arr);
    },
    async clearCompleted() {
      const arr = read().filter((t) => !t.completed);
      write(arr);
    },
  };
}

function httpRepository(baseUrl: string): TodoRepository {
  const headers = { 'Content-Type': 'application/json' };
  return {
    async list() {
      const res = await fetch(`${baseUrl}/api/todos`);
      if (!res.ok) throw new Error(`list failed: ${res.status}`);
      return res.json();
    },
    async add(text, priority) {
      const res = await fetch(`${baseUrl}/api/todos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, priority }),
      });
      if (!res.ok) throw new Error(`add failed: ${res.status}`);
      return res.json();
    },
    async update(id, patch) {
      const res = await fetch(`${baseUrl}/api/todos/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`update failed: ${res.status}`);
      return res.json();
    },
    async delete(id) {
      const res = await fetch(`${baseUrl}/api/todos/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`delete failed: ${res.status}`);
    },
    async clearCompleted() {
      const res = await fetch(`${baseUrl}/api/todos?only=completed`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`clearCompleted failed: ${res.status}`);
    },
  };
}

