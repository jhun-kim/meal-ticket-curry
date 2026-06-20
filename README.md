# Meal Ticket Curry

Meal Ticket Curry is a mobile-first web service concept for a simple community loop: an adult adds 200 yen at checkout, the store posts one meal ticket on the wall, and a child or guardian can use it for warm curry without shame.

## Wave 1 Scope

Issue #3 implements the first scaffold slice from the ULW plan:

- Product guardrails in `docs/product-policy.md`
- Next.js App Router + TypeScript + Tailwind CSS
- Public landing route at `/`
- Accessible CTA links for the meal-ticket loop and privacy guardrails
- Vitest unit/domain test
- Playwright landing smoke test

Wave 1 intentionally does not implement donor checkout, Stripe credentials, Supabase auth/RLS, redemption flow, settlement, or child identity collection.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm run test -- --run
npm run test:e2e
npm run build
```

## Product Guardrails

- Do not collect child names, photos, schools, phone numbers, or family details.
- Do not add donor-to-child messaging, ranking, or public recognition mechanics.
- Do not add payment credentials or live payment processor setup in Wave 1.
- Keep ticket-use language discreet, ordinary, and neutral.
