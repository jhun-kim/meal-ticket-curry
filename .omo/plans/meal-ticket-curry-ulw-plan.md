# Meal Ticket Curry 모바일/웹 서비스 ULW 계획

## TL;DR
> **Summary**: `Meal Ticket Curry`는 어른 손님이 결제 시 작은 금액을 더 내면 가게 벽/보드에 익명 "한 끼 티켓"이 생기고, 아이/보호자가 낙인 없이 따뜻한 카레 한 끼를 이용할 수 있게 하는 모바일-first 지역 신뢰 서비스다.
> **Deliverables**: 제품 thesis/non-goals, personas, core flows, safety/anti-stigma/abuse policies, MVP scope, data model, API endpoints, frontend routes, auth/storage choices, test/QA plan, issue-driven task breakdown.
> **Effort**: Large
> **Parallel**: YES - 4 waves
> **Critical Path**: Product/policy foundation -> app scaffold/data/auth -> ticket purchase/post/redeem flows -> settlement/admin/QA

## Context

### Original Request
- 아이들이 벽에 붙어 있는 티켓을 가져오면 무료로 카레를 먹을 수 있었던 구조를 모바일/웹 서비스로 만들고 싶다.
- 어른 손님이 계산할 때 200엔을 추가로 내면 그 돈이 "한 끼 티켓"이 되어 벽에 붙는다.
- 형편이 어려운 아이들도 눈치 보지 않고 따뜻한 한 끼를 먹을 수 있어야 한다.
- 현재 작업은 GitHub repo `jhun-kim/meal-ticket-curry` issue #1이며 계획 산출물만 작성한다.

### Repo Findings
- `README.md`만 tracked source로 존재한다.
- 앱, package manifest, database schema, test infra, CI가 아직 없다.
- Greenfield 계획이므로 project bootstrap부터 포함한다.

### Interview Summary
- 사용자와 issue #1이 acceptance criteria를 이미 제공했다.
- 추가 질문 없이 기본값을 적용한다.
- 구현 금지: 이 계획은 future issue-driven work를 위한 실행 계획이다.

### Metis Review (gaps addressed)
이 세션 surface에는 native `spawn_agent(agent_type="metis")` 도구가 노출되지 않아 별도 Metis subagent를 호출하지 못했다. 대신 `omo:ulw-plan`의 Metis gap analysis 항목을 본 에이전트가 적용했다.
- **Gap: 낙인 방지와 운영 검증이 충돌할 수 있음** -> 아이는 무계정/무신원으로 두고, 검증은 가게/티켓/정산 레이어에서 수행한다.
- **Gap: 결제와 정산을 MVP에서 모두 자동화하면 범위가 커짐** -> 결제 수납은 Stripe, 가게 정산은 weekly manual settlement report로 분리한다.
- **Gap: "벽 티켓"의 감성 구현이 디지털에서 약해질 수 있음** -> public board UI와 in-store board print/QR companion을 함께 설계한다.
- **Gap: 아동 안전상 직접 메시징/사진 후기 위험** -> 후원자-아동 직접 연결, 아동 사진, 이름, 학교 정보 수집을 금지한다.
- **Gap: 악용 방지 정책이 과하면 이용자가 위축됨** -> child-facing flow에는 제약 설명을 노출하지 않고 staff/admin tools에만 risk controls를 둔다.

## Product Thesis / Non-Goals

### Product Thesis
`Meal Ticket Curry`는 "작은 추가 결제 -> 보드에 붙는 한 끼 -> 자연스러운 식사"라는 오프라인 선순환을 디지털로 보존한다. 핵심 가치는 후원 효율이 아니라 **눈치 보지 않는 이용 경험**, **지역 가게 중심 신뢰**, **개인정보를 거의 요구하지 않는 안전한 식사 접근성**이다.

### Non-Goals
- 복지 수급 자격 심사 플랫폼이 아니다.
- 아동의 이름/사진/학교/가정형편을 확인하거나 저장하지 않는다.
- 후원자와 아이를 직접 연결하는 커뮤니티/메신저를 만들지 않는다.
- 후원자를 경쟁시키는 leaderboard, ranking, badge economy를 만들지 않는다.
- MVP에서 자동 가게 payout, multi-region franchise 운영, native iOS/Android 앱을 만들지 않는다.
- "무료 급식"처럼 보이는 UI copy, 별도 줄서기, 별도 메뉴판을 강요하지 않는다.

## Personas

### 아이/보호자 (`child/guardian`)
- 목표: 설명 없이 자연스럽게 따뜻한 한 끼를 먹는다.
- 제약: 스마트폰이 없을 수 있고, 계정 생성이나 개인정보 제공은 부담스럽다.
- UX 원칙: "지원 대상"이라는 라벨 없이 일반 주문처럼 보이게 한다. staff가 조용히 처리할 수 있어야 한다.

### 후원자/어른 손님 (`donor/customer`)
- 목표: 결제할 때 200엔 또는 지정 금액으로 한 끼 티켓을 남긴다.
- 제약: 번거로운 회원가입 없이 빠르게 참여하고, 돈이 실제로 쓰였다는 최소한의 신뢰 신호를 원한다.
- UX 원칙: checkout add-on, QR donation, 감사 페이지를 30초 안에 완료한다. 후원자의 선행을 과시하지 않는다.

### 가게/파트너 (`store/partner`)
- 목표: 티켓을 게시하고, 아이가 오면 간단히 확인/사용 처리하고, 정산받는다.
- 제약: 바쁜 피크타임에 복잡한 admin flow를 쓸 수 없다.
- UX 원칙: mobile staff mode에서 `Redeem`을 2 taps 이내로 끝낸다. 보드 상태와 정산 내역이 명확해야 한다.

### 운영자 (`operator/admin`)
- 목표: 파트너 승인, 티켓 흐름, safety policy, abuse signal, settlement를 관리한다.
- 제약: 지역 신뢰를 해치지 않으면서 악용을 막아야 한다.
- UX 원칙: audit log, partner verification, anomaly review, settlement export가 필요하다.

## Mobile-First Core Flows

### 1. 티켓 구매/생성 (`ticket purchase/create`)
1. 후원자가 가게 계산대 QR 또는 웹 `Donate` 버튼을 연다.
2. 기본 금액은 `200 JPY`, 추가 옵션은 `400/600/1000 JPY`.
3. 결제 완료 후 `TicketBatch`가 생성되고 가게별 `MealTicket` 재고가 `available` 상태로 늘어난다.
4. 후원자는 감사 화면에서 "오늘 벽에 한 끼가 붙었습니다" 수준의 익명 상태만 본다.

### 2. 벽/보드 게시 (`wall/board posting`)
1. 가게 staff가 `Store Board`에서 available ticket count를 확인한다.
2. 오프라인 벽에는 실제 종이 티켓 또는 공용 QR poster를 붙인다.
3. 디지털 `Board` 화면은 "오늘 남아 있는 한 끼"를 부드럽게 표시하되 아동 대상 추적 정보는 표시하지 않는다.

### 3. 티켓 사용 (`ticket redemption`)
1. 아이/보호자가 벽 티켓을 가져오거나 직원에게 "한 끼 티켓"을 요청한다.
2. staff가 `Redeem` 화면에서 `Use 1 ticket`을 누른다.
3. 시스템은 가장 오래된 available ticket을 `redeemed`로 바꾸고 `Redemption` record를 남긴다.
4. 아이에게 별도 인증, 이름 입력, 휴대폰 번호 요구를 하지 않는다.

### 4. 가게 확인 (`store confirmation`)
1. staff login 후 store-scoped dashboard에 접근한다.
2. `Redeem`은 store staff role만 가능하다.
3. duplicate redemption, no inventory, suspended store 상태는 조용한 error state로 처리한다.

### 5. 정산 (`settlement`)
1. 운영자는 주간 `SettlementReport`를 생성한다.
2. report는 store별 sold/redeemed/expired/available ticket count와 payable amount를 포함한다.
3. MVP에서는 CSV export와 manual bank transfer 기록으로 닫는다.
4. 이후 Stripe Connect/자동 payout을 검토한다.

### 6. 감사/피드백 (`gratitude/feedback`)
1. 후원자는 결제 직후 감사 메시지와 anonymized impact count를 본다.
2. 가게는 하루 마감 시 "오늘 사용된 티켓 수"를 확인한다.
3. 아이/보호자 피드백은 선택형 익명 prompt만 제공한다. 자유 텍스트와 사진 업로드는 MVP에서 제외한다.

## Safety, Trust, and Policy Decisions

### 낙인 방지 UX (`anti-stigma UX`)
- 아이 화면을 별도 앱으로 만들지 않는다. MVP child flow는 오프라인 벽 티켓 + staff redeem 중심이다.
- `free`, `poor`, `needy`, `welfare` 같은 단어를 child-facing copy에서 금지한다.
- 티켓 사용은 일반 주문과 같은 카운터에서 처리한다.
- 디지털 board는 "남은 무료 티켓"보다 "벽에 붙은 한 끼"처럼 따뜻하고 중립적인 표현을 사용한다.
- staff 교육 checklist를 운영자 화면에 포함한다: 묻지 않기, 크게 말하지 않기, 따로 줄 세우지 않기.

### 아동 안전 (`child safety`)
- 아동 계정, 아동 프로필, 사진, 학교, 보호자 연락처를 MVP에서 수집하지 않는다.
- 후원자-아동 직접 메시징을 만들지 않는다.
- 위치 정보는 store location만 저장한다. child device location은 요청하지 않는다.
- 피드백은 fixed-choice anonymous feedback만 허용한다.
- 운영자에게 unsafe incident report flow를 제공한다.

### 악용 방지 (`abuse prevention`)
- store staff role만 redemption 가능.
- ticket status state machine: `available -> reserved? -> redeemed | expired | voided`.
- store/day redemption cap과 manual override를 둔다.
- repeated rapid redemption, after-hours redemption, unusually high void rate를 anomaly로 표시한다.
- 모든 staff/admin action에 `AuditLog`를 남긴다.
- suspicious store는 `suspended` 상태로 전환할 수 있다.

### 개인정보 최소화 (`data minimization`)
- Donor: payment provider customer id, optional email for receipt, display name optional and hidden by default.
- Child/guardian: no account, no direct identifiers.
- Store: business verification data and payout contact only.
- Retention: audit/settlement records는 회계 목적 기간 보관, optional donor email은 unsubscribe/delete 가능.

### 지역 신뢰/검증 정책 (`local trust/verification`)
- Partner onboarding requires operator approval.
- Store verification fields: business name, address, contact, owner/staff identity check status, bank transfer destination, signed partner pledge.
- 운영자는 community partner notes를 내부에만 저장한다.
- public page에는 verified partner badge와 basic store info만 표시한다.

## MVP Scope and Later Stages

### MVP Scope
- Responsive mobile-first web app.
- Public landing/partner store list.
- Donor checkout entry and payment completion placeholder/Stripe integration task.
- Store dashboard with board count and redeem action.
- Admin dashboard for partner approval, tickets, redemptions, settlement CSV.
- Supabase data model and RLS policy.
- Basic audit log and anomaly flags.
- Playwright mobile QA scenarios and Vitest unit tests for ticket state transitions.

### Later Stages
- Native app wrapper or installed PWA enhancements.
- Stripe Connect or local payout automation.
- Multi-region operators and franchise-level dashboards.
- POS integration for partner stores.
- Advanced fraud/risk scoring.
- Donation subscriptions and corporate matching.
- Multilingual localization.
- Anonymous aggregate impact reporting by neighborhood.

## Architecture Choices

### Frontend
- `Next.js App Router` with TypeScript.
- `Tailwind CSS` for mobile-first UI.
- Server Components for read-only public/admin data where possible.
- Server Actions or Route Handlers for mutations; choose one consistent pattern during implementation. Recommended: Route Handlers under `/api/*` for clear API testing.

### Backend/Data
- `Supabase Postgres` for relational state, RLS, auth.
- `Supabase Auth` for store/admin users.
- `Supabase Storage` only for partner verification documents in later MVP hardening; no child media storage.
- `Stripe Checkout` or `Stripe Payment Links` for donation payment. MVP can begin with payment abstraction and mock webhook, then wire Stripe.

### Auth
- Public: `GET /`, `GET /stores`, `GET /stores/[storeSlug]/board`, donation entry.
- Donor: no required account; optional email receipt through Stripe.
- Store: `store_staff` role scoped to `storeId`.
- Operator: `operator` role scoped globally.

## Data Model

### Tables
- `profiles`
  - `id uuid primary key`
  - `auth_user_id uuid unique`
  - `role text check ('operator','store_staff')`
  - `store_id uuid nullable`
  - `display_name text`
  - `created_at timestamptz`

- `stores`
  - `id uuid primary key`
  - `slug text unique`
  - `name text`
  - `address text`
  - `region text`
  - `status text check ('pending','verified','suspended','closed')`
  - `ticket_unit_amount integer default 200`
  - `currency text default 'JPY'`
  - `daily_redemption_limit integer default 20`
  - `created_at timestamptz`

- `donations`
  - `id uuid primary key`
  - `store_id uuid references stores`
  - `amount integer`
  - `currency text`
  - `ticket_count integer`
  - `payment_provider text`
  - `payment_reference text unique`
  - `donor_email text nullable`
  - `status text check ('pending','paid','refunded','failed')`
  - `created_at timestamptz`

- `meal_tickets`
  - `id uuid primary key`
  - `store_id uuid references stores`
  - `donation_id uuid references donations`
  - `status text check ('available','redeemed','expired','voided')`
  - `posted_at timestamptz`
  - `redeemed_at timestamptz nullable`
  - `expires_at timestamptz nullable`
  - `created_at timestamptz`

- `redemptions`
  - `id uuid primary key`
  - `ticket_id uuid unique references meal_tickets`
  - `store_id uuid references stores`
  - `staff_profile_id uuid references profiles`
  - `redeemed_at timestamptz`
  - `notes text nullable`
  - `source text check ('staff_button','qr_staff','admin_adjustment')`

- `settlement_reports`
  - `id uuid primary key`
  - `store_id uuid references stores`
  - `period_start date`
  - `period_end date`
  - `redeemed_count integer`
  - `gross_amount integer`
  - `status text check ('draft','exported','paid','adjusted')`
  - `csv_url text nullable`
  - `created_at timestamptz`

- `audit_logs`
  - `id uuid primary key`
  - `actor_profile_id uuid nullable references profiles`
  - `actor_role text`
  - `store_id uuid nullable references stores`
  - `action text`
  - `entity_type text`
  - `entity_id uuid`
  - `metadata jsonb`
  - `created_at timestamptz`

- `feedback_events`
  - `id uuid primary key`
  - `store_id uuid references stores`
  - `redemption_id uuid nullable references redemptions`
  - `type text check ('donor_thanks_viewed','store_daily_note','anonymous_meal_feedback')`
  - `rating integer nullable`
  - `metadata jsonb`
  - `created_at timestamptz`

## API Endpoints

### Public/Donor
- `GET /api/stores` - verified stores list.
- `GET /api/stores/[storeSlug]/board` - board summary: available count bucket, store info, donation options.
- `POST /api/donations/checkout` - create donation checkout session.
- `POST /api/webhooks/stripe` - mark donation paid and create `meal_tickets`.
- `GET /api/donations/[donationId]/thanks` - anonymized thanks payload.

### Store Staff
- `GET /api/store/board` - authenticated store board state.
- `POST /api/store/tickets/redeem` - redeem one available ticket atomically.
- `POST /api/store/tickets/void` - void mistaken redemption, operator visible.
- `GET /api/store/settlements` - store settlement history.
- `POST /api/store/feedback/daily-note` - optional internal daily note.

### Operator/Admin
- `GET /api/admin/stores`
- `POST /api/admin/stores/[storeId]/approve`
- `POST /api/admin/stores/[storeId]/suspend`
- `GET /api/admin/tickets`
- `GET /api/admin/redemptions`
- `POST /api/admin/settlements/generate`
- `GET /api/admin/settlements/[settlementId]/export`
- `GET /api/admin/audit-logs`
- `GET /api/admin/anomalies`

## Frontend Routes

### Public
- `/` - service overview, verified store CTA, donor CTA.
- `/stores` - verified partner list.
- `/stores/[storeSlug]` - store page.
- `/stores/[storeSlug]/board` - public wall/board view.
- `/donate/[storeSlug]` - donation amount selection.
- `/donate/thanks/[donationId]` - donation thanks page.

### Store
- `/store/login`
- `/store/dashboard`
- `/store/board`
- `/store/redeem`
- `/store/settlements`
- `/store/training` - anti-stigma and safety checklist.

### Admin
- `/admin/login`
- `/admin/dashboard`
- `/admin/stores`
- `/admin/stores/[storeId]`
- `/admin/tickets`
- `/admin/redemptions`
- `/admin/settlements`
- `/admin/audit-logs`
- `/admin/anomalies`

## Verification Strategy
> ZERO HUMAN INTERVENTION for implementation verification. Human approval is only for product/legal launch decisions.

- Test decision: tests-after for greenfield implementation, with Vitest for domain logic and Playwright for mobile-first flows.
- QA policy: Every implementation task includes at least one happy path and one failure/edge scenario.
- Evidence: future workers save screenshots/logs under `.omo/evidence/task-{N}-{slug}.{ext}`.
- Required commands after implementation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run build`

## Accessibility / Mobile QA Checklist
- 375px, 390px, 430px, 768px, and desktop widths render without horizontal overflow.
- Primary store staff redemption action is reachable with one thumb and has a confirmation/undo-safe pattern.
- Touch targets are at least 44px.
- Color contrast meets WCAG AA.
- Screen reader labels exist for donation amount, board count, redeem action, and settlement export.
- No child-facing page exposes stigmatizing copy.
- Donation and redemption flows work with slow 3G simulation.
- Error states do not expose sensitive details.
- Keyboard navigation works for admin/store dashboards.
- Playwright screenshots cover public board, donation, store redeem, admin settlement.

## Execution Strategy

### Parallel Execution Waves
- **Wave 1 Foundation**: product copy/policy, project scaffold, schema, auth/RLS, design system.
- **Wave 2 Core Flows**: donor checkout, board, store redeem, admin store management, tests.
- **Wave 3 Operations**: settlement, audit/anomaly, feedback, safety training, accessibility QA.
- **Wave 4 Hardening**: e2e suite, build/CI, seed data, documentation, launch checklist.

### Dependency Matrix
- Task 1 blocks all UI copy and policy-sensitive tasks.
- Task 2 blocks all code tasks.
- Task 3 blocks API/data tasks 6-12.
- Task 4 blocks store/admin protected routes.
- Task 5 supports tasks 6-12.
- Task 6 blocks task 7 donation thanks and ticket creation verification.
- Task 8 blocks settlement and redemption QA.
- Task 10 blocks operator approval and settlement review.
- Task 13 finalizes cross-flow QA after all implementation tasks.

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task has References + Acceptance Criteria + QA Scenarios.

- [ ] 1. Product Policy and Content Contract

  **What to do**: Create product copy and policy constants for anti-stigma language, child safety, donor thanks, partner pledge, and staff training. Add a `docs/product-policy.md` and reusable content source such as `src/lib/policy-copy.ts`.
  **Must NOT do**: Do not introduce child eligibility screening, donor-child messaging, photos, or stigmatizing terms.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 7, 9, 11 | Blocked By: none

  **References**:
  - Pattern: `README.md:1` - existing concept and persona framing.
  - Requirement: GitHub issue #1 - acceptance criteria for thesis, personas, safety, abuse prevention.

  **Acceptance Criteria**:
  - [ ] `docs/product-policy.md` defines thesis, non-goals, approved/disallowed copy, staff behavior checklist, and privacy rules.
  - [ ] No child-facing copy contains `poor`, `needy`, `welfare`, `free meal recipient`, or equivalent stigmatizing wording.
  - [ ] Policy copy is imported by public/store/admin UI instead of duplicated.

  **QA Scenarios**:
  ```text
  Scenario: Copy scan
    Tool: bash
    Steps: rg -n "poor|needy|welfare|free meal recipient" docs src app || true
    Expected: No child-facing copy hit; any policy-only discussion is explicitly marked disallowed.
    Evidence: .omo/evidence/task-1-copy-scan.txt

  Scenario: Staff checklist present
    Tool: bash
    Steps: rg -n "묻지 않기|따로 줄|크게 말" docs src app
    Expected: Staff training content includes all three anti-stigma behaviors.
    Evidence: .omo/evidence/task-1-staff-checklist.txt
  ```

  **Commit**: YES | Message: `docs(policy): define meal ticket product guardrails` | Files: `docs/product-policy.md`, `src/lib/policy-copy.ts`

- [ ] 2. Project Scaffold and Tooling

  **What to do**: Scaffold Next.js App Router TypeScript app with Tailwind, ESLint, Vitest, Playwright, and package scripts. Keep the repo root clean and preserve `README.md`.
  **Must NOT do**: Do not add native mobile app, backend framework outside Next.js, or unrelated dependencies.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3-13 | Blocked By: none

  **References**:
  - Pattern: `README.md:1` - app name and concept.
  - External: Next.js official App Router docs.
  - External: Playwright official testing docs.

  **Acceptance Criteria**:
  - [ ] `package.json` has `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e` scripts.
  - [ ] `app/`, `src/`, `tests/`, and `e2e/` structure exists.
  - [ ] `npm run build` succeeds on scaffold.

  **QA Scenarios**:
  ```text
  Scenario: Scaffold builds
    Tool: bash
    Steps: npm install && npm run build
    Expected: Build exits 0.
    Evidence: .omo/evidence/task-2-build.txt

  Scenario: Test scripts exist
    Tool: bash
    Steps: npm run lint && npm run typecheck && npm run test -- --run
    Expected: All commands exit 0 on scaffold.
    Evidence: .omo/evidence/task-2-scripts.txt
  ```

  **Commit**: YES | Message: `chore(app): scaffold mobile first web app` | Files: `package.json`, `app/**`, `src/**`, `tests/**`, `e2e/**`

- [ ] 3. Supabase Schema, Domain Types, and Ticket State Machine

  **What to do**: Add Supabase migrations and TypeScript domain types for `stores`, `profiles`, `donations`, `meal_tickets`, `redemptions`, `settlement_reports`, `audit_logs`, and `feedback_events`. Implement atomic redeem database function or transaction wrapper.
  **Must NOT do**: Do not store child identity fields.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 6, 8, 10, 12 | Blocked By: 2

  **References**:
  - Data model section in this plan.
  - External: Supabase Row Level Security docs.

  **Acceptance Criteria**:
  - [ ] Migration defines all listed tables and constraints.
  - [ ] `meal_tickets.status` only allows `available`, `redeemed`, `expired`, `voided`.
  - [ ] Unit tests prove `available -> redeemed` succeeds once and duplicate redeem fails.

  **QA Scenarios**:
  ```text
  Scenario: Atomic redeem
    Tool: bash
    Steps: npm run test -- ticket-state
    Expected: One available ticket becomes redeemed and one redemption is created.
    Evidence: .omo/evidence/task-3-ticket-state.txt

  Scenario: Duplicate redemption blocked
    Tool: bash
    Steps: npm run test -- ticket-state
    Expected: Second redeem attempt returns deterministic no inventory/already redeemed result.
    Evidence: .omo/evidence/task-3-ticket-state-error.txt
  ```

  **Commit**: YES | Message: `feat(data): add meal ticket schema and state machine` | Files: `supabase/migrations/**`, `src/lib/domain/**`, `tests/**`

- [ ] 4. Auth, Roles, and RLS

  **What to do**: Configure Supabase Auth helpers and role enforcement for `operator` and `store_staff`. Add middleware/route guards for `/store/*` and `/admin/*`.
  **Must NOT do**: Do not require donor or child accounts.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 8, 10, 12 | Blocked By: 2, 3

  **References**:
  - Auth choices in this plan.
  - Data model `profiles.role`.

  **Acceptance Criteria**:
  - [ ] Public routes are accessible without login.
  - [ ] Store staff can access only their own store data.
  - [ ] Operator can access admin routes.
  - [ ] Unauthenticated access to `/store/dashboard` and `/admin/dashboard` redirects to login.

  **QA Scenarios**:
  ```text
  Scenario: Store guard
    Tool: playwright
    Steps: Visit /store/dashboard without session.
    Expected: Browser lands on /store/login.
    Evidence: .omo/evidence/task-4-store-guard.png

  Scenario: Cross-store RLS blocked
    Tool: bash
    Steps: npm run test -- rls
    Expected: store_staff for Store A cannot read Store B tickets.
    Evidence: .omo/evidence/task-4-rls-error.txt
  ```

  **Commit**: YES | Message: `feat(auth): add store and operator access control` | Files: `src/lib/auth/**`, `middleware.ts`, `app/store/**`, `app/admin/**`, `tests/**`

- [ ] 5. Mobile-First UI Shell and Accessible Components

  **What to do**: Build base layout, navigation, form controls, amount selector, board count display, status banners, and confirmation dialogs for small screens first.
  **Must NOT do**: Do not create marketing-only hero as the primary app experience; first viewport should expose the usable service path.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6-12 | Blocked By: 1, 2

  **References**:
  - Frontend routes in this plan.
  - Accessibility checklist in this plan.

  **Acceptance Criteria**:
  - [ ] Shared UI components meet 44px touch target minimum.
  - [ ] Layout has no horizontal overflow at 375px.
  - [ ] Components support loading, empty, success, and error states.

  **QA Scenarios**:
  ```text
  Scenario: Mobile shell visual check
    Tool: playwright
    Steps: Open / at 390x844 and capture screenshot.
    Expected: Primary donation/store paths visible, no overlap, no horizontal scroll.
    Evidence: .omo/evidence/task-5-mobile-shell.png

  Scenario: Keyboard accessibility
    Tool: playwright
    Steps: Tab through primary controls.
    Expected: Focus order is visible and logical.
    Evidence: .omo/evidence/task-5-keyboard.txt
  ```

  **Commit**: YES | Message: `feat(ui): add mobile first service shell` | Files: `app/**`, `src/components/**`, `src/styles/**`

- [ ] 6. Donor Donation and Ticket Creation Flow

  **What to do**: Implement `/donate/[storeSlug]`, `POST /api/donations/checkout`, Stripe/mock checkout abstraction, webhook handling, and ticket creation from paid donations.
  **Must NOT do**: Do not require donor registration or expose recipient identity.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7, 8, 12 | Blocked By: 3, 5

  **References**:
  - API endpoints `POST /api/donations/checkout`, `POST /api/webhooks/stripe`.
  - Data model `donations`, `meal_tickets`.

  **Acceptance Criteria**:
  - [ ] Donation amount creates correct `ticket_count` based on `stores.ticket_unit_amount`.
  - [ ] Paid webhook creates `meal_tickets` with `available` status.
  - [ ] Failed payment does not create tickets.

  **QA Scenarios**:
  ```text
  Scenario: Successful donation creates tickets
    Tool: bash
    Steps: npm run test -- donations
    Expected: 600 JPY donation for 200 JPY unit creates 3 available tickets.
    Evidence: .omo/evidence/task-6-donation.txt

  Scenario: Failed payment creates no tickets
    Tool: bash
    Steps: npm run test -- donations
    Expected: failed webhook leaves ticket count unchanged.
    Evidence: .omo/evidence/task-6-donation-error.txt
  ```

  **Commit**: YES | Message: `feat(donor): create donation checkout and ticket issuance` | Files: `app/donate/**`, `app/api/donations/**`, `app/api/webhooks/**`, `src/lib/payments/**`, `tests/**`

- [ ] 7. Public Store Board and Thanks Flow

  **What to do**: Implement public store list, store page, board view, and donation thanks page with anti-stigma copy and anonymized impact.
  **Must NOT do**: Do not show exact child usage history, child details, or donor leaderboard.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 1, 5, 6

  **References**:
  - Routes `/stores`, `/stores/[storeSlug]/board`, `/donate/thanks/[donationId]`.
  - Policy copy from Task 1.

  **Acceptance Criteria**:
  - [ ] Board displays store info and available ticket count bucket or exact count according to policy.
  - [ ] Thanks page shows donation status and warm neutral copy.
  - [ ] Suspended stores are hidden from public store list.

  **QA Scenarios**:
  ```text
  Scenario: Public board
    Tool: playwright
    Steps: Visit /stores/demo-curry/board on mobile viewport.
    Expected: Store name, board state, donate CTA visible; no stigmatizing copy.
    Evidence: .omo/evidence/task-7-board.png

  Scenario: Suspended store hidden
    Tool: bash
    Steps: npm run test -- public-stores
    Expected: suspended store does not appear in public store API.
    Evidence: .omo/evidence/task-7-suspended-error.txt
  ```

  **Commit**: YES | Message: `feat(public): add store board and donation thanks pages` | Files: `app/stores/**`, `app/donate/thanks/**`, `app/api/stores/**`, `tests/**`, `e2e/**`

- [ ] 8. Store Staff Board and Redemption Flow

  **What to do**: Implement `/store/dashboard`, `/store/board`, `/store/redeem`, `GET /api/store/board`, and `POST /api/store/tickets/redeem` with atomic redemption and quiet error states.
  **Must NOT do**: Do not ask the child/guardian for name, phone, photo, or reason.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9, 12 | Blocked By: 3, 4, 5, 6

  **References**:
  - Core flow "티켓 사용 (`ticket redemption`)".
  - Data model `redemptions`.

  **Acceptance Criteria**:
  - [ ] Store staff can redeem one available ticket in two taps or fewer from dashboard.
  - [ ] No inventory shows staff-only calm error state.
  - [ ] Redemption writes `redemptions` and `audit_logs`.

  **QA Scenarios**:
  ```text
  Scenario: Staff redeems one ticket
    Tool: playwright
    Steps: Login as store_staff, open /store/redeem, tap Use 1 ticket, confirm.
    Expected: Success state appears and board count decreases by 1.
    Evidence: .omo/evidence/task-8-redeem.png

  Scenario: No inventory
    Tool: playwright
    Steps: Seed store with 0 available tickets, attempt redeem.
    Expected: No redemption record created and calm staff-only empty state appears.
    Evidence: .omo/evidence/task-8-redeem-error.png
  ```

  **Commit**: YES | Message: `feat(store): add staff board and ticket redemption` | Files: `app/store/**`, `app/api/store/**`, `src/lib/tickets/**`, `tests/**`, `e2e/**`

- [ ] 9. Store Training and Safety Feedback

  **What to do**: Implement `/store/training`, daily note, anonymous fixed-choice feedback event, and unsafe incident escalation path for operators.
  **Must NOT do**: Do not add free-text child testimonials or image upload.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 11 | Blocked By: 1, 4, 5, 8

  **References**:
  - Safety, Trust, and Policy Decisions.
  - Data model `feedback_events`.

  **Acceptance Criteria**:
  - [ ] Store training page includes anti-stigma checklist.
  - [ ] Feedback events store no direct child identifiers.
  - [ ] Unsafe incident creates operator-visible audit/event record.

  **QA Scenarios**:
  ```text
  Scenario: Training checklist
    Tool: playwright
    Steps: Login as store_staff and open /store/training.
    Expected: Checklist is readable on 390px viewport and has no horizontal overflow.
    Evidence: .omo/evidence/task-9-training.png

  Scenario: Feedback rejects text/photo
    Tool: bash
    Steps: npm run test -- feedback
    Expected: API rejects unsupported free-text/photo payload fields.
    Evidence: .omo/evidence/task-9-feedback-error.txt
  ```

  **Commit**: YES | Message: `feat(store): add safety training and anonymous feedback` | Files: `app/store/training/**`, `app/api/store/feedback/**`, `src/lib/feedback/**`, `tests/**`

- [ ] 10. Operator Partner Management and Admin Dashboard

  **What to do**: Implement admin store approval/suspension, ticket/redemption overview, audit log browsing, and anomaly list.
  **Must NOT do**: Do not expose admin dashboards publicly or allow store staff to approve themselves.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 11, 12 | Blocked By: 3, 4, 5

  **References**:
  - Routes `/admin/stores`, `/admin/audit-logs`, `/admin/anomalies`.
  - Region trust/verification policy.

  **Acceptance Criteria**:
  - [ ] Operator can approve, suspend, and view stores.
  - [ ] Suspended stores cannot receive new donations or redemptions.
  - [ ] Audit log records approval/suspension actions.

  **QA Scenarios**:
  ```text
  Scenario: Approve partner
    Tool: playwright
    Steps: Login as operator, approve pending store.
    Expected: Store status changes to verified and appears in public store API.
    Evidence: .omo/evidence/task-10-approve.png

  Scenario: Store staff blocked from admin
    Tool: playwright
    Steps: Login as store_staff and visit /admin/stores.
    Expected: Access denied or redirect; no admin data rendered.
    Evidence: .omo/evidence/task-10-admin-error.png
  ```

  **Commit**: YES | Message: `feat(admin): manage partners and audit activity` | Files: `app/admin/**`, `app/api/admin/**`, `src/lib/admin/**`, `tests/**`, `e2e/**`

- [ ] 11. Settlement Reports and CSV Export

  **What to do**: Implement weekly settlement report generation, store settlement history, operator export, and manual paid marking.
  **Must NOT do**: Do not implement automatic payouts in MVP.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 13 | Blocked By: 8, 10

  **References**:
  - Core flow "정산 (`settlement`)".
  - Data model `settlement_reports`.

  **Acceptance Criteria**:
  - [ ] Operator can generate settlement for a date range.
  - [ ] Report counts redeemed tickets and payable amount by store.
  - [ ] CSV export includes `store_name`, `period_start`, `period_end`, `redeemed_count`, `gross_amount`, `currency`, `status`.
  - [ ] Store staff can view their own settlement history only.

  **QA Scenarios**:
  ```text
  Scenario: Generate weekly settlement
    Tool: bash
    Steps: npm run test -- settlements
    Expected: 5 redeemed tickets at 200 JPY create 1000 JPY gross amount.
    Evidence: .omo/evidence/task-11-settlement.txt

  Scenario: Cross-store settlement blocked
    Tool: bash
    Steps: npm run test -- settlement-rls
    Expected: Store A staff cannot read Store B settlement report.
    Evidence: .omo/evidence/task-11-settlement-error.txt
  ```

  **Commit**: YES | Message: `feat(settlement): add weekly reports and csv export` | Files: `app/admin/settlements/**`, `app/store/settlements/**`, `app/api/admin/settlements/**`, `src/lib/settlements/**`, `tests/**`

- [ ] 12. Abuse Prevention, Audit, and Anomaly Rules

  **What to do**: Implement audit logging helpers and anomaly detection for rapid redemption, daily cap exceeded, after-hours redemption, high void rate, and suspended store actions.
  **Must NOT do**: Do not block legitimate child-facing use with visible suspicion language.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 13 | Blocked By: 3, 4, 8, 10

  **References**:
  - Abuse prevention section.
  - Data model `audit_logs`.

  **Acceptance Criteria**:
  - [ ] Mutating store/admin APIs write audit logs.
  - [ ] Daily cap returns staff-safe message and operator anomaly.
  - [ ] `/admin/anomalies` lists actionable anomaly records.

  **QA Scenarios**:
  ```text
  Scenario: Daily cap anomaly
    Tool: bash
    Steps: npm run test -- anomalies
    Expected: Redemption over store daily limit is blocked or flagged according to configured policy.
    Evidence: .omo/evidence/task-12-anomaly.txt

  Scenario: Suspended store action blocked
    Tool: bash
    Steps: npm run test -- suspended-store
    Expected: Donation checkout and redemption fail for suspended store.
    Evidence: .omo/evidence/task-12-suspended-error.txt
  ```

  **Commit**: YES | Message: `feat(risk): add audit logs and anomaly checks` | Files: `src/lib/audit/**`, `src/lib/anomalies/**`, `app/api/**`, `app/admin/anomalies/**`, `tests/**`

- [ ] 13. End-to-End QA, Seeds, CI, and Documentation

  **What to do**: Add seed data, full Playwright journeys, CI workflow, README update, `.env.example`, and launch checklist.
  **Must NOT do**: Do not claim launch readiness without passing build/lint/typecheck/test/e2e.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: none | Blocked By: 1-12

  **References**:
  - Verification Strategy.
  - Accessibility / Mobile QA Checklist.

  **Acceptance Criteria**:
  - [ ] Seed data includes one verified store, one pending store, one donor payment fixture, and ticket inventory.
  - [ ] Playwright covers donor checkout mock, public board, staff redeem, admin approval, settlement export.
  - [ ] CI runs lint, typecheck, unit tests, e2e, and build.
  - [ ] README explains local setup, environment variables, test commands, and product guardrails.

  **QA Scenarios**:
  ```text
  Scenario: Full happy path
    Tool: playwright
    Steps: Run e2e full journey from donation mock to board to store redemption to settlement.
    Expected: All steps pass and screenshots are saved.
    Evidence: .omo/evidence/task-13-full-e2e.png

  Scenario: CI command suite
    Tool: bash
    Steps: npm run lint && npm run typecheck && npm run test -- --run && npm run test:e2e && npm run build
    Expected: All commands exit 0.
    Evidence: .omo/evidence/task-13-ci-suite.txt
  ```

  **Commit**: YES | Message: `test(e2e): verify meal ticket mvp journey` | Files: `e2e/**`, `.github/workflows/**`, `README.md`, `.env.example`, `supabase/seed.sql`

## Final Verification Wave
> ALL must APPROVE before completing future implementation work.

- [ ] F1. Plan Compliance Audit
  - Confirm every issue #1 acceptance criterion is covered by product docs, code, or tests.
  - Evidence: `.omo/evidence/f1-plan-compliance.md`

- [ ] F2. Code Quality Review
  - Review source for duplicated policy logic, unsafe privacy fields, missing RLS, and inconsistent ticket state handling.
  - Evidence: `.omo/evidence/f2-code-quality.md`

- [ ] F3. Real Manual QA via Browser Automation
  - Use Playwright/browser to inspect mobile flows at 390x844 and desktop admin screens.
  - Evidence: `.omo/evidence/f3-manual-qa.md`

- [ ] F4. Scope Fidelity Check
  - Verify no native app, no child accounts, no donor-child messaging, no photos/testimonials, no automatic payouts were added.
  - Evidence: `.omo/evidence/f4-scope-fidelity.md`

## Commit Strategy
- Use one commit per task when implemented.
- Keep commits small and issue-driven.
- Do not commit `.omo/evidence` unless the project decides evidence artifacts belong in git.
- Recommended branch: `feature/issue-1-meal-ticket-plan` for planning, then `feature/meal-ticket-mvp` for implementation.

## Success Criteria
- The product can explain and preserve the original "pay 200 yen, put a ticket on the wall, child eats without shame" loop.
- A donor can create tickets without account creation.
- A store can post and redeem tickets quickly without asking child identity questions.
- An operator can approve partners, audit activity, and generate weekly settlement reports.
- Tests prove ticket state transitions, RLS boundaries, redemption duplicate prevention, settlement math, and key mobile flows.
- Accessibility and mobile QA pass for the core routes.

## Defaults Applied
- Stack: Next.js App Router, TypeScript, Tailwind, Supabase, Stripe.
- Currency: configurable, default `JPY`; unit amount default `200`.
- Test strategy: tests-after because repo has no existing implementation.
- Settlement: manual CSV export in MVP, automatic payout later.
- Child UX: no account, no identity collection, staff-mediated redemption.

## Decisions Needed
- None for planning. Legal/compliance review is required before real public launch, but it does not block MVP implementation planning.

