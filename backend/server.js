// Minimal Node HTTP server (no dependencies) to stub a Todo API
// NOTE: This is an in-memory store for development only.

const http = require('http');
const { URL } = require('url');

/** @typedef {{id:string,text:string,completed:boolean,priority:'low'|'medium'|'high',createdAt:number,updatedAt:number}} Todo */

/** @type {Todo[]} */
let todos = [];

const PORT = process.env.PORT || 4000;
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '*';
  const send = (status, data, headers = {}) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...headers,
    });
    res.end(typeof data === 'string' ? data : JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    return send(204, '');
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    return send(200, { ok: true });
  }

  if (url.pathname === '/api/todos' && req.method === 'GET') {
    return send(200, todos);
  }

  if (url.pathname === '/api/todos' && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const text = (body?.text || '').toString().trim();
      const priority = ['low', 'medium', 'high'].includes(body?.priority) ? body.priority : 'medium';
      if (!text) return send(400, { error: 'text is required' });
      const now = Date.now();
      const todo = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        completed: false,
        priority,
        createdAt: now,
        updatedAt: now,
      };
      todos.unshift(todo);
      return send(201, todo);
    } catch (e) {
      return send(400, { error: 'invalid JSON' });
    }
  }

  if (url.pathname.startsWith('/api/todos/') && req.method === 'PATCH') {
    try {
      const id = url.pathname.split('/').pop();
      const body = await readJson(req);
      const t = todos.find((x) => x.id === id);
      if (!t) return send(404, { error: 'not found' });
      if (typeof body.text === 'string') t.text = body.text.trim();
      if (typeof body.completed === 'boolean') t.completed = body.completed;
      if (['low', 'medium', 'high'].includes(body.priority)) t.priority = body.priority;
      t.updatedAt = Date.now();
      return send(200, t);
    } catch (e) {
      return send(400, { error: 'invalid JSON' });
    }
  }

  if (url.pathname.startsWith('/api/todos/') && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const before = todos.length;
    todos = todos.filter((t) => t.id !== id);
    return send(before === todos.length ? 404 : 204, before === todos.length ? { error: 'not found' } : '');
  }

  if (url.pathname === '/api/todos' && req.method === 'DELETE') {
    // Optional: clear completed
    const only = url.searchParams.get('only');
    if (only === 'completed') {
      todos = todos.filter((t) => !t.completed);
      return send(204, '');
    }
    // Clear all
    todos = [];
    return send(204, '');
  }

  return send(404, { error: 'route not found' });
});

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

