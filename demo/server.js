const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const port = Number(process.env.PORT || 4173);
let tasks = [
  { id: 1, title: 'Review pull request', completed: false },
  { id: 2, title: 'Run regression suite', completed: true }
];

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'content-type': `${type}; charset=utf-8` });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/health') return send(res, 200, { status: 'ok' });
  if (url.pathname === '/api/tasks' && req.method === 'GET') return send(res, 200, tasks);
  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const input = JSON.parse(raw || '{}');
    if (!input.title?.trim()) return send(res, 400, { error: 'Title is required' });
    const task = { id: Date.now(), title: input.title.trim(), completed: false };
    tasks.push(task);
    return send(res, 201, task);
  }
  const match = url.pathname.match(/^\/api\/tasks\/(\d+)$/);
  if (match && req.method === 'DELETE') {
    const before = tasks.length;
    tasks = tasks.filter(task => task.id !== Number(match[1]));
    return before === tasks.length ? send(res, 404, { error: 'Not found' }) : send(res, 204, '');
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return send(res, 200, await readFile(join(__dirname, 'index.html'), 'utf8'), 'text/html');
  }
  send(res, 404, { error: 'Not found' });
}).listen(port, '127.0.0.1', () => console.log(`Demo server listening on ${port}`));
