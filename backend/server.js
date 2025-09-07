// Minimal Node HTTP server with PostgreSQL-backed Todo API
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');
const { query, ensureSchema } = require('./db');

const PORT = process.env.PORT || 4000;
let schemaEnsured = false;

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
    try {
      if (!schemaEnsured) {
        await ensureSchema();
        schemaEnsured = true;
      }
      // quick connectivity check
      await query('SELECT 1');
      return send(200, { ok: true, db: 'ok' });
    } catch (e) {
      return send(200, { ok: true, db: 'error', error: String(e.message || e) });
    }
  }

  if (url.pathname === '/api/todos' && req.method === 'GET') {
    try {
      if (!schemaEnsured) { await ensureSchema(); schemaEnsured = true; }
      const { rows } = await query(
        'SELECT id, text, completed, priority, created_at AS "createdAt", updated_at AS "updatedAt" FROM public.todos ORDER BY created_at DESC'
      );
      return send(200, rows);
    } catch (e) {
      return send(500, { error: 'db_error', detail: String(e.message || e) });
    }
  }

  if (url.pathname === '/api/todos' && req.method === 'POST') {
    try {
      if (!schemaEnsured) { await ensureSchema(); schemaEnsured = true; }
      const body = await readJson(req);
      const text = (body?.text || '').toString().trim();
      const priority = ['low', 'medium', 'high'].includes(body?.priority) ? body.priority : 'medium';
      if (!text) return send(400, { error: 'text is required' });
      const now = Date.now();
      const id = crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random().toString(36).slice(2, 10)}`;
      const params = [id, text, false, priority, now, now];
      const insertSql = 'INSERT INTO public.todos (id, text, completed, priority, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, text, completed, priority, created_at AS "createdAt", updated_at AS "updatedAt"';
      const { rows } = await query(insertSql, params);
      return send(201, rows[0]);
    } catch (e) {
      // JSON parse or DB error
      if (e instanceof SyntaxError) return send(400, { error: 'invalid JSON' });
      return send(500, { error: 'db_error', detail: String(e.message || e) });
    }
  }

  if (url.pathname.startsWith('/api/todos/') && req.method === 'PATCH') {
    try {
      if (!schemaEnsured) { await ensureSchema(); schemaEnsured = true; }
      const id = url.pathname.split('/').pop();
      const body = await readJson(req);
      const fields = [];
      const params = [];
      let idx = 1;
      if (typeof body.text === 'string') { fields.push(`text = $${idx++}`); params.push(body.text.trim()); }
      if (typeof body.completed === 'boolean') { fields.push(`completed = $${idx++}`); params.push(body.completed); }
      if (['low', 'medium', 'high'].includes(body.priority)) { fields.push(`priority = $${idx++}`); params.push(body.priority); }
      fields.push(`updated_at = $${idx++}`); params.push(Date.now());
      params.push(id);
      const sql = `UPDATE public.todos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, text, completed, priority, created_at AS "createdAt", updated_at AS "updatedAt"`;
      const { rows } = await query(sql, params);
      if (!rows[0]) return send(404, { error: 'not found' });
      return send(200, rows[0]);
    } catch (e) {
      if (e instanceof SyntaxError) return send(400, { error: 'invalid JSON' });
      return send(500, { error: 'db_error', detail: String(e.message || e) });
    }
  }

  if (url.pathname.startsWith('/api/todos/') && req.method === 'DELETE') {
    try {
      if (!schemaEnsured) { await ensureSchema(); schemaEnsured = true; }
      const id = url.pathname.split('/').pop();
      const { rowCount } = await query('DELETE FROM public.todos WHERE id = $1', [id]);
      return send(rowCount ? 204 : 404, rowCount ? '' : { error: 'not found' });
    } catch (e) {
      return send(500, { error: 'db_error', detail: String(e.message || e) });
    }
  }

  if (url.pathname === '/api/todos' && req.method === 'DELETE') {
    try {
      if (!schemaEnsured) { await ensureSchema(); schemaEnsured = true; }
      const only = url.searchParams.get('only');
      if (only === 'completed') {
        await query('DELETE FROM public.todos WHERE completed = TRUE');
        return send(204, '');
      }
      await query('DELETE FROM public.todos');
      return send(204, '');
    } catch (e) {
      return send(500, { error: 'db_error', detail: String(e.message || e) });
    }
  }

  return send(404, { error: 'route not found' });
});

server.listen(PORT, async () => {
  console.log(`API listening on http://localhost:${PORT}`);
  try {
    await ensureSchema();
    schemaEnsured = true;
    console.log('DB schema ready.');
  } catch (e) {
    console.warn('Could not ensure DB schema at startup:', e.message || e);
  }
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
