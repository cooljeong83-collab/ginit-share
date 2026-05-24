# 웹 공유 QA 체크리스트

환경: Supabase `0077` + `0273` + `0274` + `0275` 적용, 앱·웹 동일 Supabase URL·Anon 키, ginit-share 최신 배포.

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

## 보안 (회귀)

1. **타인 퇴장**: 다른 브라우저에서 남의 `ginitweb_*` + 빈 secret으로 `meeting_share_guest_leave` → 실패.
2. **API 무토큰**: `POST /api/place-thumbnail` `{}` → 401.
3. **썸네일**: 장소 카드 이미지 로드, 요청에 `X-Ginit-Share-Token` 또는 `shareToken`.
4. **guest_get**: 응답에 `leaveSecretHash`·`joinRequests[].message` 없음.
5. (선택) 레거시 참여자(해시 없음) 나가기 → `leave_secret_required` 안내.

## 앱 UI

1. 웹 게스트 닉 표시, 탭 시 「웹 참여자」 안내.
