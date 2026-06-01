# 웹 공유 QA 체크리스트

환경: Supabase `0273`–`0279`·`0326` 적용, ginit-share·ginit-app 최신 배포.

**필수 Vercel env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, **`SUPABASE_SERVICE_ROLE_KEY`** (서버 전용).  
guest RPC는 브라우저가 `/api/share/*`만 호출 — anon 키로 `meeting_share_guest_*` 직접 RPC 불가(`0279`).

## OPEN 모임

1. 호스트가 **로그인 상태**에서 앱 **웹 공유** → URL 생성.
2. 비로그인 브라우저 `/s/{token}` → 제목·후보·투표 UI.
3. 참여자명 입력 후 **참여하기** → localStorage에 `userId` + `leaveSecret`.
4. 앱 모임 상세에서 참여·투표 반영.
5. **모임 나가기** → 성공.
6. 다른 브라우저 동일 링크 신규 참여 → 정원 초과 시 에러.

## HOST_APPROVAL 모임

1. **참가 신청** → 앱 대기 신청.
2. 호스트 승인 → `ginitweb_` 참여자 집계 반영.
3. 승인 전 나가기 → 신청 취소.

## 토큰·링크

1. 잘못된·만료·폐기 토큰 → 안내 문구.
2. 로그아웃 상태 앱에서 공유 링크 생성 → 실패 (`meeting_share_auth_required`).

## Rate limit (Vercel WAF / Upstash)

1. `docs/VERCEL_FIREWALL.md` 따라 WAF path 규칙 Publish 또는 Upstash env 설정.
2. 동일 IP에서 `/api/place-thumbnail` 1분 40회 초과 → 429.

## 보안 (회귀)

1. **타인 퇴장**: 다른 브라우저에서 남의 `ginitweb_*` + 빈 secret으로 `meeting_share_guest_leave` → 실패.
2. **API 무토큰**: `POST /api/place-thumbnail` `{}` → 401.
3. **썸네일**: 장소 카드 이미지 로드, 요청에 `X-Ginit-Share-Token` 또는 `shareToken`.
4. **guest_get**: 응답에 `leaveSecretHash`·`joinRequests[].message` 없음.
5. (선택) 레거시 참여자(해시 없음) 나가기 → `leave_secret_required` 안내.
6. **URL**: `placeCandidates[].naverPlaceLink`가 `https://evil.example`이면 guest_get·웹 UI에서 링크 없음(0276).

## 비공개 모임 · 웹 공유 → 지닛 참여 (0326)

1. 호스트가 비공개 모임 웹 공유 링크 생성 → `/s/{token}` 로드·게스트 참여 OK (회귀).
2. **지닛 참여** → 앱(로그인) → 모임 상세 표시 — 「모임을 찾을 수 없어요」 없음.
3. 비공개·즉시 참여: 앱 **참여하기** → `participantIds`에 앱 계정 반영.
4. (공개·HOST_APPROVAL만 해당) 웹 참가 신청 회귀; 앱 딥링크는 상세 조회 후 앱 참가 신청.

## 앱 UI

1. 웹 게스트 닉 표시, 탭 시 「웹 참여자」 안내.

## 회귀 (딥링크·권한)

1. 공개 모임 `ginitapp://meeting/{id}` (shareToken 없음) — 기존과 동일.
2. 앱 비공개 **친구 초대**만(token 없음) — 상세·참여 OK.
3. 만료·잘못된 shareToken 딥링크 — 앱 접근 불가(기존과 동일).
