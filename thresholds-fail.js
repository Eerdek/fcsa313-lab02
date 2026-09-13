// Алхам 4: Thresholds — САНААТАЙГААР хатуу болгосон хувилбар (FAIL хүлээгдэж буй)
//
// p(95)<50 гэдэг нь энэ нөхцөлд ХЭЗЭЭ Ч биелэхгүй: зөвхөн гадаад сайт руу холбогдох
// (TLS handshake + RTT) л 50 мс-ээс их байдаг. Зорилго нь CI pipeline дээрх quality gate
// яг ингэж ажилладгийг харуулах — threshold зөрчигдвөл k6 exit code 99 буцааж,
// pipeline улаан болно.
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 30, duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<50'],    // САНААТАЙ хатуу — FAIL болох ёстой
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status 200 байна': (r) => r.status === 200 });
  sleep(1);
}
