# Meal Ticket Curry Product Policy

## Product Thesis

Meal Ticket Curry exists to make a warm curry meal quietly available when a child or guardian needs one. The core loop is intentionally simple: an adult pays an extra 200 yen, the store places a meal ticket where guests can see it, and a child or guardian can use that ticket without being singled out.

The product should protect dignity before it optimizes growth, storytelling, or operational detail. Every screen, sign, workflow, and partner practice should make the ticket feel like a normal community gesture, not a public label.

## Product Non-Goals

- Build donor identity, donor status, or donor competition mechanics.
- Create direct messaging between donors and children, guardians, or ticket users.
- Rank donors, stores, children, guardians, or ticket users.
- Collect minor identity, education, contact, or image information.
- Process real checkout, payment credentials, refunds, or financial settlement in this scaffold.
- Implement Supabase, authentication, redemption, or settlement flows in this scaffold.
- Turn ticket use into marketing content, testimonial collection, or social proof.

## Stigma-Prevention Copy Rules

Use language that frames the ticket as ordinary, shared, and available. Copy should be short, neutral, and action-oriented.

Preferred copy patterns:

- "Add a 200 yen meal ticket."
- "Use a meal ticket for curry."
- "Meal tickets are available at the counter."
- "Share one today. Use one when needed."
- "A ticket covers one warm curry meal."

Required copy rules:

- Refer to people as "children," "guardians," "guests," or "ticket users" only when a person label is needed.
- Prefer "use a ticket" over language that suggests receiving aid.
- Keep donor copy about the ticket, not about the person who may use it.
- Keep store copy operational and discreet.
- Avoid urgency, pity, rescue framing, or public gratitude rituals.
- Do not ask a ticket user to explain why they are using a ticket.

Forbidden copy section: the following terms and frames must not appear in product UI, signage, partner scripts, donor receipts, or public communications except in policy documents that clearly label them as forbidden examples.

- "poor"
- "needy"
- "welfare"
- "free meal recipient"
- Any phrasing that publicly separates paying guests from ticket users.
- Any phrasing that asks children or guardians to prove hardship.
- Any phrasing that invites donors to expect recognition from ticket users.

## Child Safety And Privacy Minimization

The product must minimize collection, display, and retention of information about children and guardians.

Never collect, request, infer, store, or display:

- Names of minors.
- Images or videos of minors.
- Education institution names, class names, grade details, or education identifiers.
- Direct contact details, email addresses, home addresses, social handles, or other contact information for children or guardians.
- Notes about family situation, income, immigration status, disability, health, religion, or other sensitive circumstances.
- Attendance history tied to an identifiable child or guardian.

Operational privacy rules:

- Ticket use should not require account creation.
- Ticket use should not require a child or guardian to speak a special phrase.
- Ticket use should not require a child or guardian to present personal documents.
- Store staff should handle ticket use the same way they handle ordinary meal ordering.
- Any aggregate reporting should be store-level and count-based only, without identifying ticket users.

## Partner And Store Checklist

Before a partner store participates, confirm that it can follow these rules:

- Display meal tickets in a visible but respectful place.
- Let a child or guardian use a ticket without questioning their circumstances.
- Serve the same curry quality and portion expected for a standard ticket meal.
- Train staff to treat ticket use as a normal order flow.
- Avoid taking pictures, filming, interviewing, or posting about ticket users.
- Keep any internal counts aggregate and anonymous.
- Remove used tickets promptly so public counts stay understandable.
- Escalate safety concerns through normal local safeguarding procedures, not through the product.
- Make it clear that adding a ticket is optional and that using a ticket is welcome.
- Keep store signage neutral, practical, and consistent with the copy rules above.

## Abuse-Prevention And Settlement Guardrails

The scaffold may describe policy and model local-only states, but it must not implement real financial, redemption, or settlement infrastructure.

Allowed guardrails for this phase:

- Document that one meal ticket maps to one curry meal.
- Document that each ticket has a simple state such as available, used, voided, or expired.
- Show sample counts for donated, available, and used tickets without connecting to real payment systems.
- Describe store reconciliation as a future operational need.
- Use fake sample data only.

Disallowed implementation in this phase:

- Real checkout or payment credential collection.
- Live payment processor integration.
- Supabase setup, authentication, database writes, or storage.
- Redemption codes that could be used in a real store.
- Settlement automation, payouts, invoices, or tax reporting.
- Donor-child messaging, public ranking, or recognition mechanics.
- User profiles for children, guardians, or ticket users.

Abuse-prevention rules for future implementation:

- Prefer anonymous, count-based controls before identity-based controls.
- Prevent duplicate settlement claims at the store-ticket level, not by identifying children.
- Keep audit data focused on tickets and stores.
- Require manual review for unusual store-level patterns before taking action.
- Do not deny a child or guardian a meal through automated risk scoring.
- Keep donor receipts limited to the donor's purchase and the number of tickets added.

## Product Decision Test

Before adding a feature, ask:

- Does it make a warm curry meal easier to share or use?
- Does it protect the dignity of the child or guardian using a ticket?
- Does it avoid collecting personal information?
- Does it avoid making donors central to the experience?
- Can the same goal be achieved with aggregate counts or store-level controls?

If the answer to any of these is no, the feature should not be built without a new policy review.
