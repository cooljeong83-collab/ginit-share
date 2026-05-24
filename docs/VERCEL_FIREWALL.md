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
cd ginit-share
vercel link
node scripts/apply-vercel-firewall-rate-limits.mjs --dry-run
node scripts/apply-vercel-firewall-rate-limits.mjs
```

대시보드 **Firewall → Review Changes → Publish** 로 프로덕션 반영.

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

## 검증

```bash
# 토큰 없이 401 (기존)
curl -s -o /dev/null -w "%{http_code}\n" -X POST "https://<host>/api/place-thumbnail" \
  -H "Content-Type: application/json" -d '{}'

# WAF 적용 후: 동일 IP에서 1분에 40회 초과 → 429 (엣지 또는 middleware)
```

응답 헤더 `Retry-After: 60` 확인.

## Hobby 플랜

Firewall custom rate limit 규칙은 **프로젝트당 1개** 제한이 있습니다. Hobby는 path 규칙 하나로 `/api` prefix(120/분)만 쓰거나 Pro로 업그레이드하세요.
