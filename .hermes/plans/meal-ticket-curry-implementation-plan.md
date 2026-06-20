# Meal Ticket Curry Implementation Plan

## Purpose
이 문서는 `.omo/plans/meal-ticket-curry-ulw-plan.md`를 future issue-driven implementation에 맞게 압축한 실행용 계획이다. 현재 세션에서는 구현하지 않는다.

## Product Thesis
어른 손님이 결제 시 200엔 또는 지정 금액을 더 내면 가게 벽/보드에 익명 "한 끼 티켓"이 생기고, 아이/보호자가 낙인 없이 카레 한 끼를 먹을 수 있게 한다. 서비스의 핵심은 결제 효율보다 지역 신뢰, 아동 안전, 개인정보 최소화, 그리고 자연스러운 식사 경험이다.

## Non-Goals
- 복지 자격 심사, 아동 신원 확인, 아동 사진/학교/연락처 저장.
- 후원자-아동 직접 메시징.
- 후원자 leaderboard/ranking.
- MVP 자동 payout, native mobile app, POS integration.

## Recommended Stack
- App: Next.js App Router + TypeScript + Tailwind CSS.
- Data/Auth: Supabase Postgres + Supabase Auth + RLS.
- Payment: Stripe Checkout/Payment Links plus webhook.
- Tests: Vitest + Playwright.
- Deployment-ready target: Vercel + Supabase.

## Core Personas
- `child/guardian`: 계정 없이 벽 티켓/직원 도움으로 자연스럽게 식사.
- `donor/customer`: 계산 시 빠르게 200엔 단위 후원, 감사 페이지 확인.
- `store/partner`: 티켓 게시, 사용 처리, 정산 확인.
- `operator/admin`: 파트너 검증, 악용 방지, audit, settlement 운영.

## Core Routes
- Public: `/`, `/stores`, `/stores/[storeSlug]`, `/stores/[storeSlug]/board`, `/donate/[storeSlug]`, `/donate/thanks/[donationId]`
- Store: `/store/login`, `/store/dashboard`, `/store/board`, `/store/redeem`, `/store/settlements`, `/store/training`
- Admin: `/admin/login`, `/admin/dashboard`, `/admin/stores`, `/admin/stores/[storeId]`, `/admin/tickets`, `/admin/redemptions`, `/admin/settlements`, `/admin/audit-logs`, `/admin/anomalies`

## Core APIs
- Public/Donor: `GET /api/stores`, `GET /api/stores/[storeSlug]/board`, `POST /api/donations/checkout`, `POST /api/webhooks/stripe`, `GET /api/donations/[donationId]/thanks`
- Store: `GET /api/store/board`, `POST /api/store/tickets/redeem`, `POST /api/store/tickets/void`, `GET /api/store/settlements`, `POST /api/store/feedback/daily-note`
- Admin: `GET /api/admin/stores`, `POST /api/admin/stores/[storeId]/approve`, `POST /api/admin/stores/[storeId]/suspend`, `GET /api/admin/tickets`, `GET /api/admin/redemptions`, `POST /api/admin/settlements/generate`, `GET /api/admin/settlements/[settlementId]/export`, `GET /api/admin/audit-logs`, `GET /api/admin/anomalies`

## Core Data Model
- `profiles`: operator/store_staff role and store scope.
- `stores`: partner identity, status, region, ticket unit amount, daily redemption limit.
- `donations`: payment state, amount, ticket count, optional donor email.
- `meal_tickets`: available/redeemed/expired/voided ticket inventory.
- `redemptions`: one redeemed ticket event, staff actor, timestamp.
- `settlement_reports`: weekly manual settlement records and CSV export.
- `audit_logs`: all sensitive store/admin mutations.
- `feedback_events`: anonymous fixed-choice events only.

## Implementation Issues
1. `docs(policy): define meal ticket product guardrails`
   - Create `docs/product-policy.md` and reusable policy copy.
   - Acceptance: no stigmatizing child-facing copy; staff checklist present.

2. `chore(app): scaffold mobile first web app`
   - Add Next.js, Tailwind, Vitest, Playwright, scripts.
   - Acceptance: `npm run build`, `lint`, `typecheck`, `test` pass.

3. `feat(data): add meal ticket schema and state machine`
   - Add migrations and domain tests.
   - Acceptance: duplicate redemption blocked.

4. `feat(auth): add store and operator access control`
   - Add Supabase Auth, RLS, route guards.
   - Acceptance: store staff cannot read another store.

5. `feat(ui): add mobile first service shell`
   - Add components, mobile layout, accessibility states.
   - Acceptance: no overflow at 375/390px; 44px touch targets.

6. `feat(donor): create donation checkout and ticket issuance`
   - Add donation flow and Stripe/mock webhook.
   - Acceptance: paid donation creates correct ticket count.

7. `feat(public): add store board and donation thanks pages`
   - Add public board and thanks flow.
   - Acceptance: suspended stores hidden; no sensitive usage history.

8. `feat(store): add staff board and ticket redemption`
   - Add store dashboard and atomic redeem action.
   - Acceptance: two-tap redemption and calm no-inventory state.

9. `feat(store): add safety training and anonymous feedback`
   - Add training and fixed-choice feedback.
   - Acceptance: rejects free-text/photo payloads.

10. `feat(admin): manage partners and audit activity`
   - Add partner approval/suspension and admin dashboards.
   - Acceptance: approval affects public visibility; store staff blocked.

11. `feat(settlement): add weekly reports and csv export`
   - Add weekly settlement report and manual paid marking.
   - Acceptance: correct settlement math and RLS.

12. `feat(risk): add audit logs and anomaly checks`
   - Add audit helper and anomaly rules.
   - Acceptance: daily cap and suspended-store actions handled.

13. `test(e2e): verify meal ticket mvp journey`
   - Add seeds, e2e, CI, README, `.env.example`.
   - Acceptance: lint, typecheck, unit, e2e, build all pass.

## Verification Commands
After implementation:
```bash
npm run lint
npm run typecheck
npm run test -- --run
npm run test:e2e
npm run build
```

## Mobile and Accessibility QA
- Test 375px, 390px, 430px, 768px, desktop.
- Confirm no horizontal overflow.
- Confirm donation/redeem controls have 44px touch targets.
- Confirm WCAG AA contrast.
- Confirm screen reader labels on amount selection, board count, redeem button, settlement export.
- Confirm no child-facing stigma terms.
- Confirm slow network loading/error states.

## Launch Guardrails
- Legal/compliance review before public launch.
- Partner pledge and staff training required before store verification.
- No child identity collection without a separate safety/legal review.
- No automatic payout until settlement audit trail is stable.

