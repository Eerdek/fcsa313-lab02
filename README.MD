# Лаборатори №2 — Гүйцэтгэлийн хэмжүүрийг k6-аар хэмжих

**Оюутан:** ERDENEBAYR
**Оюутны код:** B232270136
**Хичээл:** F.CSA313 — Программ хангамжийн чанарын баталгаа ба тест (2026)

---

## 1. Ажлын орчин

```
$ k6 version
k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64)
```

| Зүйл | Утга |
|---|---|
| Хэрэгсэл | Grafana k6 v2.2.0 (AGPL v3, нээлттэй эх) |
| ҮС | Windows 11 Pro (26200) |
| Локал сервер | Node.js v24.18.0 (built-in `http` модуль) |
| Бай (target) | `https://test.k6.io` ба `http://127.0.0.1:8787` (өөрийн машин) |

> **Орчны тайлбар.** Заавар Ubuntu-д зориулагдсан бөгөөд Windows дээр "WSL2 ашиглах эсвэл
> орчиндоо өөрөө тохируулна" гэж зөвшөөрсөн. Энэ машин дээр WSL суулгаагүй тул k6-ийн албан ёсны
> Windows binary-г (`k6-v2.2.0-windows-amd64.zip`, GitHub release) татаж `%LOCALAPPDATA%\k6`-д
> задалж PATH-д нэмсэн. Скрипт, команд, хэмжүүр бүгд Linux хувилбартай ижил.

> **Ёс зүй.** Тест зөвхөн (1) зааврын албан ёсны дадлагын сайт `test.k6.io`,
> (2) энэ машин дээр ажиллуулсан локал сервер рүү хийгдсэн. Өөр ямар ч бодит вебсайт руу
> load тест хийгээгүй.

---

## 2. Репозиторийн бүтэц

```
script.js                   Алхам 2: анхны/baseline тест (5 VU)
stages.js                   Алхам 3: шатлан өсгөх (5 -> 30 -> 100 -> 0 VU)
thresholds-pass.js          Алхам 4: SLO threshold (baseline-аас гаргасан)  -> PASS
thresholds-fail.js          Алхам 4: санаатайгаар хатуу threshold           -> FAIL
thresholds-local-pass.js    Алхам 4+5: локал сервер дээрх тогтвортой PASS
local-test.js               Алхам 5: локал сервер рүү хийх тест
local-server/server.js      Алхам 5: локал тест сервер (/, /slow, /cpu)
results/                    k6-ийн БҮТЭН текст гаралтууд (.txt)
screenshots/                Ажиллуулалт бүрийн summary дэлгэцийн зургууд
```

---

## 3. Алхам 2 — Анхны тест (BASELINE)

```
k6 run script.js          # vus: 5, duration: 30s -> results/run-baseline-05vu-30s.txt
```

| Хэмжүүр | Утга | Лекц 2-ын ойлголт |
|---|---|---|
| `http_req_duration` avg | 204.92 ms | дундаж хариу хугацаа |
| `http_req_duration` p(90) | 313.12 ms | latency 90-р процентиль |
| **`http_req_duration` p(95)** | **317.55 ms** | **BASELINE — SLO-гийн суурь** |
| `http_reqs` | 210 (6.81 req/s) | **throughput** |
| `http_req_failed` | 0.00% (0 / 210) | **error rate** = POFOD-ийн аналог |

Хавсралт: `results/run-baseline-05vu-30s.txt` · `screenshots/01-baseline-05vu-30s.png`

---

## 4. Алхам 3 — Ачааллыг шатлан өсгөх

### 4.1 Гурван түвшний харьцуулалт (ТУСАД НЬ ажиллуулсан, түвшин бүр 1 минут)

```
k6 run --vus 5   --duration 1m script.js | tee results/run-05vu.txt
k6 run --vus 30  --duration 1m script.js | tee results/run-30vu.txt
k6 run --vus 100 --duration 1m script.js | tee results/run-100vu.txt
```

| VU | p(90) latency | **p(95) latency** | max latency | **Throughput** | **Error rate** | Файл |
|---:|---:|---:|---:|---:|---:|---|
| 5 | 310.47 ms | **311.58 ms** | 411.69 ms | 420 req / **6.92 req/s** | 0.00% | `run-05vu.txt` |
| 30 | 308.85 ms | **311.77 ms** | 322.13 ms | 2 580 req / **42.22 req/s** | 0.00% | `run-30vu.txt` |
| 100 | 293.74 ms | **309.63 ms** | **2.14 s** | 8 638 req / **141.23 req/s** | 0.00% | `run-100vu.txt` |

Зургууд: `02-run-05vu.png` · `03-run-30vu.png` · `04-run-100vu.png`

### 4.2 stages ажиллуулалт (нэгтгэсэн зураглал)

```
k6 run stages.js    # 30s->5 VU, 1m->30 VU, 30s->100 VU, 30s->0 VU  (нийт 2m31s)
```

| Хэмжүүр | Утга |
|---|---|
| p(90) / p(95) | 267.97 ms / 307.14 ms |
| Throughput | 6 800 req / 44.94 req/s |
| Error rate | 0.00% (0 / 6 800) |

Хавсралт: `results/run-stages.txt` · `screenshots/05-run-stages.png`

> **АНХААР:** stages ашигласан нэг ажиллуулалт төгсгөлдөө НЭГТГЭСЭН ганц summary өгдөг тул
> дээрх 4.1-ийн хүснэгтийн тоог энэ файлаас биш, гурван ТУСДАА ажиллуулалтаас авсан.

### 4.3 Хаана "нэг хэрэглэгчийн туршлага" муудаж эхэлсэн бэ?

`test.k6.io` дээр **p(95) нь 5 -> 100 VU хүртэл бараг өөрчлөгдөөгүй** (311.58 -> 311.77 -> 309.63 ms),
харин throughput бараг **шугаман өссөн** (6.92 -> 42.22 -> 141.23 req/s). Учир нь энэ сайт CDN-ээр
тараагддаг бөгөөд хариу хугацааны дийлэнхийг сүлжээний RTT ба TLS handshake эзэлдэг — сервер ханаагүй.

Гэхдээ **сүүлт утга (tail) 100 VU дээр эрс муудсан**: max latency 411 ms -> **2.14 s** (ойролцоогоор
5 дахин). Өөрөөр хэлбэл "дунджаар бүх зүйл хэвийн" ч хамгийн азгүй хэрэглэгчид 2 секунд хүлээсэн —
яг үүнийг л лекц 2-т "дундаж утга худлаа хэлдэг, процентиль хэрэгтэй" гэж үзсэн.

**Ханалт бодитоор ямар харагддагийг** харахын тулд Алхам 5-д өөрийн локал серверийг
(нэг урсгалтай, CPU-ээр хязгаарлагдсан `/cpu` endpoint) тестэлсэн — тэнд зөрчил тодхон гарсан
(6.3-ыг үз).

---

## 5. Алхам 4 — Thresholds (SLO-гоо кодоор шалгуулах)

### 5.1 SLO-гоо яагаад ийм утгаар сонгосон бэ?

**Гадаад бай (`test.k6.io`):** Алхам 2-ын **өөрийн baseline хэмжилт p(95) = 317.55 ms** дээр
тулгуурлав. Ачаалал багатай үеийн хэвийн байдлаас 50% хүртэлх мууралтыг зөвшөөрч
`317.55 x 1.5 = 476` тул **`p(95) < 475 ms`** гэж тогтоов. Алдааны SLO-г лекцийн
availability/POFOD шаардлагаас **`rate < 0.01` (1%-иас бага)** гэж авав. Зааврын жишээн дэх
`p(95)<300` нь энэ орчинд утгагүй: зөвхөн TLS handshake ба RTT л 130 ms-аас дээш байдаг.

**Локал бай:** мөн зарчмаар — локал baseline `/slow` 5 VU дээр **p(95) = 117.56 ms**,
`117.56 x 1.5 = 176` тул **`p(95) < 175 ms`**.

### 5.2 Үр дүн — PASS ба FAIL хоёул

| # | Скрипт | Бай | Threshold | Хэмжигдсэн p(95) | Үр дүн | k6 exit code |
|---|---|---|---|---|---|---|
| 1 | `thresholds-pass.js` | test.k6.io, 30 VU / 1m | `p(95)<475`, `rate<0.01` | 300.5 ms | **PASS** | **0** |
| 2 | `thresholds-fail.js` | test.k6.io, 30 VU / 1m | `p(95)<50` (санаатай хатуу) | 288.71 ms | **FAIL** | **99** |
| 3 | `thresholds-local-pass.js` | локал `/slow`, 30 VU / 30s | `p(95)<175`, `rate<0.01` | 119.71 ms | **PASS** | **0** |

FAIL ажиллуулалтын гаралтад k6 шууд алдаа хэвлэж, **exit code 99** буцаасан:

```
  █ THRESHOLDS

    http_req_duration
    ✗ 'p(95)<50' p(95)=288.71ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%

level=error msg="thresholds on metrics 'http_req_duration' have been crossed"
k6 exit code: 99
```

CI pipeline дээрх quality gate яг ингэж ажилладаг: exit code 0-ээс ялгаатай бол build улаан болж,
SLO зөрчсөн өөрчлөлт production руу гарахгүй.

Хавсралт: `run-threshold-pass.txt`, `run-threshold-fail.txt`, `run-threshold-local-pass.txt`
Зургууд: `06-threshold-PASS.png`, `07-threshold-FAIL.png`, `14-threshold-local-PASS.png`

> **Ажиглалт:** энэ SLO-г ажиллуулахад нэг удаа **ЗӨРЧИГДӨЖ** байсан (p(95) = 1.14 s) — тухайн үед
> машин дээр видео стрим ажиллаж, интернэтийн суваг ачаалалтай байсан. Дараагийн ажиллуулалтад
> ижил threshold-оор PASS гарсан. Энэ нь гадаад бай руу тавьсан SLO нь серверээс гадна
> **клиентийн сүлжээнээс ч хамаардаг** гэдгийг харуулсан — иймээс тогтвортой PASS-ыг зааврын
> зөвлөсний дагуу локал сервер дээр (5.2-ын №3) баталгаажуулав.

---

## 6. Алхам 5 — Локал сервер тестлэх (нэмэлт гүнзгийрэл)

```
node local-server/server.js            # http://127.0.0.1:8787
k6 run -e ENDPOINT=/     --vus 30  --duration 30s local-test.js
k6 run -e ENDPOINT=/slow --vus 30  --duration 30s local-test.js
k6 run -e ENDPOINT=/cpu  --vus 100 --duration 30s local-test.js
```

Серверийн endpoint-ууд: `/` шууд хариулна · `/slow` 100 мс удаашруулна · `/cpu` ойролцоогоор
5 мс CPU ажил хийнэ.

### 6.1 Шууд vs удаашруулсан endpoint (30 VU)

| Endpoint | p(90) | p(95) | Throughput | Error rate |
|---|---:|---:|---:|---:|
| `/` (шууд) | 10.09 ms | **11.51 ms** | **4 678 req/s** | 0.00% |
| `/slow` (+100 мс) | 119.11 ms | **120.83 ms** | 265.25 req/s | 0.00% |

100 мс-ийн зохиомол саатал latency-г **ойролцоогоор 10 дахин**, throughput-ыг **18 дахин**
доройтуулсан. Гэхдээ `/slow` нь async (I/O шинжтэй) хүлээлт тул сервер ханаагүй — 5 VU дээр
p(95) = 117.56 ms, 30 VU дээр p(95) = 120.83 ms буюу бараг ижил хэвээр байв.

### 6.2 CPU-гаар хязгаарлагдсан endpoint — ачаалал өсөхөд юу болдог вэ

| VU | p(95) latency | Throughput | Error rate | Файл |
|---:|---:|---:|---:|---|
| 5 | **52.50 ms** | 171.91 req/s | 0.00% | `local-cpu-05vu.txt` |
| 30 | **248.27 ms** | 176.17 req/s | 0.00% | `local-cpu-30vu.txt` |
| 100 | **651.14 ms** | 176.15 req/s | 0.00% | `local-cpu-100vu.txt` |

### 6.3 Лекц 2-ын зөрчил яг энд гарч ирлээ

VU 5 -> 100 буюу **20 дахин** өсөхөд:

* **throughput ӨСӨӨГҮЙ** — 171.91 -> 176.15 req/s (2%). Сервер хүчин чадлынхаа таазанд тулсан.
* **p(95) latency 12.4 дахин ӨССӨН** — 52.50 ms -> 651.14 ms.
* **error rate 0% хэвээр** — систем "унаагүй", зөвхөн УДААШРАВ. Хэрэглэгч алдаа хараагүй ч
  хүлээлт нь тэвчишгүй болсон.

Энэ бол лекцийн "10 хэрэглэгчтэй үед 2с, 100 хэрэглэгчтэй үед 4с" гэсэн жишээний бодит хувилбар:
ханасан системд нэмэгдсэн хэрэглэгч бүр throughput нэмэхгүй, зөвхөн дараалалд зогсох хугацааг
уртасгадаг (Little's Law: `latency = VU / throughput`, 100 / 176 = 568 ms — хэмжсэн 651 ms-тай
ойролцоо).

Хавсралт: `local-fast-30vu.txt`, `local-slow-05vu.txt`, `local-slow-30vu.txt`,
`local-cpu-05vu.txt`, `local-cpu-30vu.txt`, `local-cpu-100vu.txt`
Зургууд: `08` … `13` дугаартай зургууд

---

## 7. Дүгнэлт

Ачааллыг 5 -> 30 -> 100 VU болгон өсгөхөд `test.k6.io` дээр p(95) latency бараг хөдөлсөнгүй
(311.58 -> 311.77 -> 309.63 ms), харин throughput бараг шугаман өсөж 6.92 -> 141.23 req/s болсон нь
энэ бай CDN-д түшиглэсэн, хүчин чадлынхаа таазанд хүрээгүйг харуулж байна. Гэсэн ч 100 VU дээр
max latency 411 ms-аас 2.14 s болж үсэрсэн нь лекц 2-ын гол сануулга — **дундаж утга биш,
процентиль ба сүүлт утга л хэрэглэгчийн бодит туршлагыг илэрхийлдэг** — гэдгийг батлав. Бодит
ханалтыг харахын тулд өөрийн локал сервер дээр CPU-гаар хязгаарлагдсан endpoint-ыг тестлэхэд
зөрчил тодхон гарсан: VU 20 дахин өсөхөд throughput 171.91 -> 176.15 req/s (2%) л өөрчлөгдөж,
p(95) latency 52.50 ms -> 651.14 ms буюу **12.4 дахин** муудсан. Өөрөөр хэлбэл **throughput ба
latency хоёрыг зэрэг сайжруулах боломжгүй**, ханасан системд нэмэгдсэн ачаалал зөвхөн дараалал
үүсгэдэг гэсэн лекцийн ойлголт бодитоор нотлогдлоо. Мөн бүх ажиллуулалтад error rate 0.00% байсан
нь чанарын хэмжүүрүүд бие даасан болохыг харуулав — **систем "унахгүйгээр" ашиглах боломжгүй
болтлоо удаашрах бүрэн боломжтой**, иймээс availability дангаараа хангалтгүй, latency-ийн SLO
зайлшгүй хэрэгтэй. SLO-гоо өөрийн baseline хэмжилт (p(95) = 317.55 ms) дээр үндэслэн
`p(95) < 475 ms` (baseline x 1.5) ба `rate < 0.01` гэж тогтоосон бөгөөд `test.k6.io` дээр
p(95) = 300.5 ms гарч **хангагдсан** (exit code 0), локал сервер дээр `p(95) < 175 ms` SLO-г
p(95) = 119.71 ms-ээр мөн **хангасан**. Threshold-оо санаатай `p(95)<50` болгон хатууруулахад k6
алдаа хэвлэж exit code 99 буцаасан нь CI pipeline дээрх quality gate яг хэрхэн ажилладгийг
харууллаа. Аргачлалын хувьд гурван түвшнийг stages-ийн нэг ажиллуулалтаас биш, тус тусад нь
ажиллуулж хэмжсэн нь чухал байв — учир нь stages нь бүх шатны хэмжилтийг нэг summary болгон
нэгтгэдэг тул түвшин бүрийн p(95)-ыг салгаж харах боломжгүй болдог. Эцэст нь нэг ажиглалт:
гадаад бай руу тавьсан SLO нэг ажиллуулалтад сүлжээний
ачааллаас болж зөрчигдсөн (p(95) = 1.14 s) нь **SLO нь хэмжилтийн орчноосоо салшгүй** — тогтвортой
дүгнэлт хийхийн тулд хэмжилтийг хяналттай орчинд давтах шаардлагатайг сануулсан.

---

## 8. Хавсаргасан бүтэн гаралтууд

| Файл | Тайлбар | Дэлгэцийн зураг |
|---|---|---|
| `results/k6-version.txt` | k6-ийн хувилбар | — |
| `results/run-baseline-05vu-30s.txt` | Алхам 2 baseline (5 VU / 30s) | `01-baseline-05vu-30s.png` |
| `results/run-05vu.txt` | 5 VU / 1m | `02-run-05vu.png` |
| `results/run-30vu.txt` | 30 VU / 1m | `03-run-30vu.png` |
| `results/run-100vu.txt` | 100 VU / 1m | `04-run-100vu.png` |
| `results/run-stages.txt` | stages 5->30->100->0 VU | `05-run-stages.png` |
| `results/run-threshold-pass.txt` | SLO PASS (test.k6.io) | `06-threshold-PASS.png` |
| `results/run-threshold-fail.txt` | SLO FAIL, exit 99 | `07-threshold-FAIL.png` |
| `results/local-fast-30vu.txt` | локал `/` 30 VU | `08-local-fast-30vu.png` |
| `results/local-slow-30vu.txt` | локал `/slow` 30 VU | `09-local-slow-30vu.png` |
| `results/local-cpu-05vu.txt` | локал `/cpu` 5 VU | `10-local-cpu-05vu.png` |
| `results/local-cpu-30vu.txt` | локал `/cpu` 30 VU | `11-local-cpu-30vu.png` |
| `results/local-cpu-100vu.txt` | локал `/cpu` 100 VU | `12-local-cpu-100vu.png` |
| `results/local-slow-05vu.txt` | локал `/slow` 5 VU (локал baseline) | `13-local-slow-05vu-baseline.png` |
| `results/run-threshold-local-pass.txt` | локал SLO PASS | `14-threshold-local-PASS.png` |

README-гийн бүх хүснэгтийн тоо дээрх `.txt` файлуудаас шууд авагдсан бөгөөд тэдгээртэй таарна.

---

## 9. Дахин ажиллуулах заавар

```bash
# 1) k6 суулгах (Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6
k6 version

# 2) Алхам 2-4 (гадаад бай)
mkdir -p results
k6 run script.js                          | tee results/run-baseline-05vu-30s.txt
k6 run --vus 5   --duration 1m script.js  | tee results/run-05vu.txt
k6 run --vus 30  --duration 1m script.js  | tee results/run-30vu.txt
k6 run --vus 100 --duration 1m script.js  | tee results/run-100vu.txt
k6 run stages.js                          | tee results/run-stages.txt
k6 run thresholds-pass.js                 | tee results/run-threshold-pass.txt
k6 run thresholds-fail.js                 | tee results/run-threshold-fail.txt   # exit 99

# 3) Алхам 5 (локал сервер)
node local-server/server.js &
k6 run -e ENDPOINT=/     --vus 30  --duration 30s local-test.js | tee results/local-fast-30vu.txt
k6 run -e ENDPOINT=/slow --vus 5   --duration 30s local-test.js | tee results/local-slow-05vu.txt
k6 run -e ENDPOINT=/slow --vus 30  --duration 30s local-test.js | tee results/local-slow-30vu.txt
k6 run -e ENDPOINT=/cpu  --vus 5   --duration 30s local-test.js | tee results/local-cpu-05vu.txt
k6 run -e ENDPOINT=/cpu  --vus 30  --duration 30s local-test.js | tee results/local-cpu-30vu.txt
k6 run -e ENDPOINT=/cpu  --vus 100 --duration 30s local-test.js | tee results/local-cpu-100vu.txt
k6 run thresholds-local-pass.js                                 | tee results/run-threshold-local-pass.txt
```
