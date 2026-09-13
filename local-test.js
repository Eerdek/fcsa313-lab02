// Алхам 5: Локал сервер рүү хийх load тест
// Бай (target): http://127.0.0.1:8787 — ӨӨРИЙН машин дээр ажиллаж буй сервер (зөвшөөрөгдсөн бай)
//
// Ажиллуулах жишээ:
//   node local-server/server.js &
//   k6 run -e ENDPOINT=/     --vus 30 --duration 30s local-test.js
//   k6 run -e ENDPOINT=/slow --vus 30 --duration 30s local-test.js
//   k6 run -e ENDPOINT=/cpu  --vus 100 --duration 30s local-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const ENDPOINT = __ENV.ENDPOINT || '/';
const THINK = parseFloat(__ENV.THINK || '0');   // think time (секунд), анхдагчаар 0

export default function () {
  const res = http.get(`http://127.0.0.1:8787${ENDPOINT}`);
  check(res, { 'status 200 байна': (r) => r.status === 200 });
  if (THINK > 0) sleep(THINK);
}
