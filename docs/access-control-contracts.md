# Access-Control Contracts

This document defines the local domain contract for Wave 2 access control and the intended Supabase RLS shape for a future live implementation. It is a contract artifact only; it does not add Supabase client setup, authentication runtime, checkout/payment credentials, child identity collection, donor-child messaging, or ranking.

## Roles

- `public`: unauthenticated visitor. May read only public board/store resources.
- `store_staff`: authenticated staff profile scoped to exactly one store. May read and manage only resources that belong to that store.
- `operator`: authenticated operator/admin profile. May access all store-scoped resources and admin resources.

There is no `child`, `guardian`, or ticket-user identity role. Ticket use must remain accountless and must not collect minor identity, guardian identity, contact details, school details, photos, hardship notes, or other sensitive circumstances.

## Resource Contracts

- Public resources: `public_board`, `public_store`.
- Store-scoped resources: `donation`, `meal_ticket`, `redemption`, `settlement_report`.
- Profile resource: `profile`, readable by its owner and manageable by operators.
- Admin resources: `audit_log`, `feedback_event`.

Store-scoped resources must carry a `storeId` and must be checked against the staff profile's store scope. Public resources are readable by everyone. Admin resources are operator-only. Store staff may read own-store donation records but may not manage donations locally because donation creation belongs to the future checkout boundary.

## Local Domain Decisions

The local `canAccessResource` contract returns an explicit decision:

- `allowed`: the actor may perform the requested action.
- `denied`: the actor may not perform the action, with a stable reason such as `private_resource`, `store_scope_mismatch`, `admin_only`, or `manage_requires_staff`.

This keeps route guards, server actions, and future RLS policy tests aligned without requiring a live Supabase runtime in this issue.

## RLS Policy Intent

Future Supabase policies should encode the same role contracts:

- `profiles`: users may read their own profile; operators may read/manage profiles.
- `stores`: public may read active public store records; store staff may read their own store; operators may manage all stores.
- `donations`: store staff may read donation records for their store only; operators may access all records. Public insert is reserved for a future checkout boundary and is not enabled by this draft.
- `meal_tickets`: store staff may read/manage tickets for their store only; operators may access all records.
- `redemptions`: store staff may read/manage redemption records for their store only; operators may access all records.
- `settlement_reports`: store staff may read reports for their store only; operators may manage all reports.
- `audit_logs`: operator-only. Store staff do not read raw audit logs.
- `feedback_events`: anonymous, fixed-choice, store-level events only. Operators may read all; store staff may read their own store aggregates/events if future UI requires it.

The RLS design must use store-level controls and aggregate counts before identity-based controls. Duplicate settlement claims should be prevented at the store-ticket level, not by identifying children or guardians.
