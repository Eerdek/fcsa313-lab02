// Алхам 4: Thresholds — SLO-гоо кодоор шалгуулах (PASS хүлээгдэж буй хувилбар)
//
// SLO-г ӨӨРИЙН baseline хэмжилтээс гаргасан:
//   Алхам 2-ын baseline (5 VU / 30s, results/run-baseline-05vu-30s.txt): p(95) = 317.55 ms
//   SLO = baseline p95 × 1.5 = 317.55 × 1.5 ≈ 476 ms  →  бөөрөнхийлж p(95) < 475 ms
// Error rate SLO нь лекц 2-ын POFOD-той шууд дүйцнэ: 1%-иас бага алдаа.
//
// АНХААР: энд stages БАЙХГҮЙ — stages болон vus/duration хоёуланг үлдээвэл stages давамгайлдаг.
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 30, duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<475'],   // SLO: p95 < 475ms (baseline 317.55ms × 1.5)
    http_req_failed:   ['rate<0.01'],   // SLO: error rate < 1%
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status 200 байна': (r) => r.status === 200 });
  sleep(1);
}
