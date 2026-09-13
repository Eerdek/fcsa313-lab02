// Алхам 5: Локал тест сервер (Node.js-ийн built-in http модуль — нэмэлт сан шаардахгүй)
//
// Endpoint-ууд:
//   GET /       — шууд хариулна (локал baseline)
//   GET /slow   — 100 мс удаашруулж хариулна (заавраар шаардсан "удаан" endpoint)
//   GET /cpu    — ~5 мс CPU ажил хийнэ. Node нэг урсгалтай тул VU өсөхөд
//                 хүсэлтүүд ЭЭЛЖИНД зогсож, лекц 2-ын "ачаалал өсөхөд latency өснө"
//                 гэсэн зөрчил бодитоор гарч ирдэг.
//
// Ажиллуулах:  node local-server/server.js     (http://127.0.0.1:8787)
const http = require('http');
const crypto = require('crypto');

const PORT = 8787;
const HOST = '127.0.0.1';

function cpuWork(ms) {
  const end = Date.now() + ms;
  let h = '';
  while (Date.now() < end) {
    h = crypto.createHash('sha256').update(h + Math.random()).digest('hex');
  }
  return h.slice(0, 8);
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const send = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  };

  if (url === '/') {
    send(200, { ok: true, endpoint: '/', note: 'шууд хариу' });
  } else if (url === '/slow') {
    setTimeout(() => send(200, { ok: true, endpoint: '/slow', delayMs: 100 }), 100);
  } else if (url === '/cpu') {
    const digest = cpuWork(5);
    send(200, { ok: true, endpoint: '/cpu', cpuMs: 5, digest });
  } else {
    send(404, { ok: false, error: 'not found' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`local test server: http://${HOST}:${PORT}  (/, /slow, /cpu)`);
});
