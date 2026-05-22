import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Reorbit" },
      {
        name: "description",
        content:
          "Get help with Reorbit. Contact our support team for questions, bugs, or feature requests.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Support</h1>
      <p className="mt-4 text-muted-foreground">
        We typically respond within one business day.
      </p>

      <section className="mt-10 space-y-6">
        <div>
          <h2 className="text-xl font-medium">Email</h2>
          <p className="mt-1">
            <a
              className="text-primary underline"
              href="mailto:support@reorbit.dev"
            >
              support@reorbit.dev
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Documentation</h2>
          <p className="mt-1 text-muted-foreground">
            Visit{" "}
            <a className="text-primary underline" href="https://reorbit.dev">
              reorbit.dev
            </a>{" "}
            for guides and FAQs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Data &amp; privacy requests</h2>
          <p className="mt-1 text-muted-foreground">
            See our{" "}
            <a className="text-primary underline" href="/privacy">
              Privacy Policy
            </a>{" "}
            or email{" "}
            <a className="text-primary underline" href="mailto:privacy@reorbit.dev">
              privacy@reorbit.dev
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
