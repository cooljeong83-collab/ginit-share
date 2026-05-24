# Vercel Firewall / 글로벌 Rate Limit

ginit-share API는 세 겹으로 제한합니다.

| 계층 | 범위 | 설정 |
|------|------|------|
| **1. Vercel WAF (path)** | 엣지, IP당, 리전별 카운터 | `scripts/apply-vercel-firewall-rate-limits.mjs` |
| **2. Upstash Redis** | 전 세계 단일 카운터 (선택) | env `UPSTASH_REDIS_*` |
| **3. @vercel/firewall SDK** | 함수 내 (WAF SDK 규칙 있을 때) | 대시보드 `@vercel/firewall` 규칙 |
| 폴백 | 로컬 `next dev` | 인메모리 (`lib/edge-rate-limit.ts`) |

## 1. Vercel WAF path 규칙 (권장)

Pro 이상에서 Firewall → Custom Rules. CLI로 일괄 추가:

```bash
# 워크스페이스 절대 경로 (홈에서 `cd ginit-share` 는 실패할 수 있음)
cd /Users/clawagent/ginit-share

vercel link   # 반드시 **ginit-share** 프로젝트 선택 (ginit-admin 아님)

# Hobby (기본, WAF 1개)
npm run firewall:apply:dry-run
npm run firewall:apply

# Pro+ (path별 WAF 3개)
npm run firewall:apply:pro:dry-run
npm run firewall:apply:pro
```

대시보드 **Firewall → Review Changes → Publish** 또는:

```bash
vercel --cwd /Users/clawagent/ginit-share firewall publish
```

기본 한도 (`firewall/rate-limit-rules.json`):

| 경로 | 분당(IP) |
|------|----------|
| `/api/place-thumbnail` | 40 |
| `/api/naver-static-map` | 60 |
| `/api` (prefix) | 120 |

> WAF 카운터는 **리전별**입니다. 여러 리전에서 동시에 트래픽이 오면 리전당 한도가 적용됩니다.

## 2. Upstash (인스턴스 분산 완전 보완)

1. [Vercel Marketplace → Upstash](https://vercel.com/integrations/upstash) 연동 또는 Upstash 콘솔에서 Redis 생성
2. 프로젝트 env에 추가:

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

재배포 후 middleware가 Redis 기준으로 전역 제한합니다. WAF와 함께 쓰면 **더 엄격한 쪽**이 먼저 걸립니다.

### Upstash Data Browser가 비어 있을 때

1. env 추가 **이후** ginit-share **Redeploy** 했는지 (env만 넣고 배포 안 하면 Redis 미사용).
2. Upstash 콘솔 DB URL이 `UPSTASH_REDIS_REST_URL` 과 같은 DB인지.
3. **트래픽**: `/api/place-thumbnail`, `/api/naver-static-map` 만 키 생성 (`guest_get` 은 Supabase).
4. Data Browser에서 `ginit-share` 검색 — TTL ~1분이라 호출 직후에만 보일 수 있음.
5. Upstash **Metrics** 에 command 수가 오르는지 (Browser보다 먼저 확인).
6. `vercel env ls` 에 Development 없으면 `npm run dev` 로컬은 Redis 안 씀 → `.env.local` 또는 Production URL로 curl.

## 3. @vercel/firewall SDK (선택)

엣지 WAF와 별도로, 함수 안에서 `checkRateLimit` 을 쓰려면 대시보드에 규칙을 추가합니다.

각 규칙:

- **If**: `@vercel/firewall`
- **Rate limit ID**: `ginit-share-place-thumbnail` 또는 `ginit-share-naver-static-map`
- **Window / Limit**: `firewall/rate-limit-rules.json` 의 `sdkRules` 와 동일

로컬에서 SDK 테스트 시 (선택):

```
VERCEL_FIREWALL_DEV_HOST=ginit-share.vercel.app
```

## 상태 확인

```bash
# Hobby: overview 는 IP Bypass 미지원으로 404 날 수 있음 → rules list 사용
vercel --cwd /Users/clawagent/ginit-share firewall rules list
vercel --cwd /Users/clawagent/ginit-share firewall diff
```

## 검증

```bash
# 토큰 없이 401 (기존)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "https://<host>/api/place-thumbnail" \
  -H "Content-Type: application/json" -d '{}'

# WAF 적용 후: 동일 IP에서 1분에 40회 초과 → 429 (엣지 또는 middleware)
```

응답 헤더 `Retry-After: 60` 확인.

## Hobby 플랜

Firewall **rate limit 규칙은 프로젝트당 1개**만 가능합니다 (`Rate limiting is not available for this plan`).

| 방식 | 명령 | WAF | path별 40/60 |
|------|------|-----|----------------|
| **이미 완료** | `place-thumbnail` publish 함 | 40/분 1개 | **Upstash 권장** |
| 규칙 교체 | `firewall discard` → `npm run firewall:apply` | `/api` 120/분 | middleware |
| Pro+ | `npm run firewall:apply:pro` | path별 3개 | WAF + middleware |

Hobby에서 `firewall:apply`를 돌리면 **첫 규칙만** staged 되고 두 번째부터 401이 납니다. 이미 `ginit-share-rl-place-thumbnail`이 staged 되어 있다면:

```bash
# 그대로 쓰기
vercel --cwd /Users/clawagent/ginit-share firewall publish

# 또는 /api 1개로 통일하려면
vercel --cwd /Users/clawagent/ginit-share firewall discard
npm run firewall:apply
vercel --cwd /Users/clawagent/ginit-share firewall publish
```

**Upstash** env를 넣고 재배포하면 Hobby에서도 path별 한도가 전역으로 적용됩니다.
