# Draft: Meal Ticket Curry ULW Plan

## Requirements (confirmed)
- GitHub repo `jhun-kim/meal-ticket-curry` issue #1: "ULW plan: mobile/web service for community meal tickets".
- 아이들이 벽에 붙은 티켓을 가져오면 무료로 카레를 먹을 수 있고, 어른 손님이 계산할 때 200엔을 추가로 내면 그 돈이 "한 끼 티켓"이 되어 벽에 붙는 구조를 모바일/웹 서비스로 계획한다.
- 지금은 구현하지 않고 계획 산출물만 작성한다.
- 산출물은 `.omo/drafts/meal-ticket-curry-ulw-plan.md`, `.omo/plans/meal-ticket-curry-ulw-plan.md`, `.hermes/plans/meal-ticket-curry-implementation-plan.md`에 저장한다.
- 계획은 한국어로 작성하되 파일/route/API 이름은 영어 병기한다.

## Technical Decisions
- Project type: greenfield. 현재 tracked source는 `README.md`뿐이며 앱/테스트 인프라가 없다.
- Recommended stack: Next.js App Router + TypeScript + Tailwind CSS + Supabase Postgres/Auth/Storage + Stripe Checkout/Payment Links for MVP.
- Product posture: mobile-first PWA before native app. 모바일 웹으로 아이/보호자, 후원자, 가게, 운영자를 모두 처리하고 이후 네이티브 앱은 후속 단계로 둔다.
- Auth policy: 아이는 계정 없이 티켓 사용 가능. 가게/운영자는 로그인 필수. 후원자는 결제 영수증/감사 페이지 접근만 이메일 기반 선택 인증.
- Privacy policy: 아동 이름, 사진, 학교, 연락처를 MVP에서 수집하지 않는다. 티켓 사용 기록은 가게, 시간, ticket id, 익명 feedback만 저장한다.
- Abuse policy: 티켓은 가게별 재고/일일 사용 한도/중복 redemption 방지/운영자 audit log로 보호한다.

## Research Findings
- `README.md`: 제품 콘셉트와 사용자 요청이 일치한다.
- GitHub issue #1: 제품 thesis, persona, 모바일-first flow, MVP scope, data model, API/backend, frontend routes, storage/auth, verification plan을 acceptance criteria로 요구한다.
- Repo state: no `package.json`, no `src`, no tests. 계획은 scaffolding부터 포함해야 한다.
- OMO/ULW: `omo:ulw-plan` skill을 세션 skill로 사용했다. 이 Codex surface에는 native `spawn_agent`/Metis callable tool이 노출되지 않아 Metis-style gap analysis를 본 에이전트가 대체 수행한다.

## Open Questions
- 없음. 사용자 요청과 issue acceptance criteria가 충분히 구체적이므로 기본값을 적용한다.

## Assumptions
- 화폐 기본값은 원 아이디어의 `JPY`/`200`을 유지하되, 구현은 `currency`와 `unitAmount`를 설정값으로 분리해 지역화 가능하게 한다.
- 초기 서비스 지역은 단일 도시/상권 단위 pilot으로 제한한다.
- 실제 현금 정산은 MVP에서 weekly manual settlement report로 처리하고, 자동 payout은 이후 단계로 둔다.
- QR code는 가게 확인과 중복 사용 방지를 위해 사용하되, 아이가 "쿠폰을 제시했다"는 인상을 최소화하는 시각 디자인을 적용한다.

## Scope Boundaries
- INCLUDE: 제품/UX/API/data/auth/storage/testing/QA/issue breakdown 계획.
- INCLUDE: 낙인 방지 UX, 아동 안전, 악용 방지, 개인정보 최소화, 지역 신뢰/검증 정책.
- EXCLUDE: 실제 앱 구현, 결제 연동 코드 작성, DB migration 작성, 배포 실행.
- EXCLUDE: 복지 자격 심사, 아동 신원 검증, 공개 ranking/leaderboard, 후원자-아동 직접 메시징.

## Clearance Check
- Core objective clearly defined: YES
- Scope boundaries established: YES
- No critical ambiguities remaining: YES
- Technical approach decided: YES
- Test strategy confirmed: YES, tests-after with Playwright/Vitest once implementation begins
- No blocking questions outstanding: YES

