import { describeMealTicketLoop, makeYenAmount } from "@/src/domain/meal-ticket";

const contribution = makeYenAmount(200);
const loop = describeMealTicketLoop(contribution);

const steps = [
  {
    title: "Adult adds 200 yen",
    body: "At checkout, a neighborhood adult adds a small contribution for the next meal.",
  },
  {
    title: "It becomes a wall meal ticket",
    body: "The shop posts a simple curry ticket where anyone can use it naturally.",
  },
  {
    title: "A child eats warm curry",
    body: "No child identity is collected, and the meal can be accepted without shame.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-between px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between gap-4" aria-label="Primary">
          <a className="text-sm font-bold tracking-[0.16em] uppercase" href="/">
            Meal Ticket Curry
          </a>
          <a
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--accent-dark)]"
            href="#loop"
          >
            See loop
          </a>
        </nav>

        <div className="grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.18em] text-[var(--warm)] uppercase">
              200 yen, one warm plate
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight font-black text-balance sm:text-6xl">
              Adult adds 200 yen. It becomes a wall meal ticket. A child eats warm curry without
              shame.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Meal Ticket Curry is a mobile-first service for restaurants and neighbors to keep a
              visible, stigma-free ticket loop moving.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-base font-bold text-white"
                href="#start"
              >
                Start with 200 yen
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 text-base font-bold text-[var(--foreground)]"
                href="#privacy"
              >
                Review privacy promise
              </a>
            </div>
          </div>

          <aside
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
            aria-label="Current ticket loop"
          >
            <dl className="grid gap-4">
              <div>
                <dt className="text-sm font-semibold text-[var(--muted)]">Contribution</dt>
                <dd className="mt-1 text-3xl font-black">{loop.adultContribution.value} yen</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-[var(--muted)]">Posted as</dt>
                <dd className="mt-1 text-xl font-bold">{loop.postedTicket}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-[var(--muted)]">Outcome</dt>
                <dd className="mt-1 text-xl font-bold">{loop.mealOutcome}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section id="loop" aria-labelledby="loop-heading">
          <h2 id="loop-heading" className="text-2xl font-black">
            The loop
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {steps.map((step) => (
              <article
                className="rounded-lg border border-[var(--border)] bg-white p-5"
                key={step.title}
              >
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="privacy"
          className="mt-8 border-t border-[var(--border)] pt-5"
          aria-labelledby="privacy-heading"
        >
          <h2 id="privacy-heading" className="text-xl font-black">
            Privacy promise
          </h2>
          <p className="mt-2 max-w-3xl leading-7 text-[var(--muted)]">
            This Wave 1 scaffold does not include checkout credentials, child identity fields,
            redemption flow, authentication, RLS, or settlement implementation.
          </p>
        </section>

        <div id="start" className="pt-8 text-sm text-[var(--muted)]">
          Built for issue #3 Wave 1.
        </div>
      </section>
    </main>
  );
}
