// Алхам 4 + 5: Thresholds-ийг ЛОКАЛ сервер дээр шалгах (тогтвортой PASS)
//
// Заавар: "PASS гаралтыг найдвартай авах хамгийн тогтвортой арга бол Алхам 5-ын
// локал сервер рүү тестлэх юм — гадаад сүлжээний хэлбэлзэл оролцохгүй."
//
// SLO-г ЛОКАЛ baseline хэмжилтээс гаргасан:
//   локал /slow, 5 VU / 30s (results/local-slow-05vu.txt): p(95) = 117.56 ms
//   SLO = 117.56 × 1.5 ≈ 176 ms  →  p(95) < 175 ms
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 30, duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<175'],   // SLO: локал baseline 117.56ms × 1.5
    http_req_failed:   ['rate<0.01'],   // SLO: error rate < 1%
  },
};

export default function () {
  const res = http.get('http://127.0.0.1:8787/slow');
  check(res, { 'status 200 байна': (r) => r.status === 200 });
}
