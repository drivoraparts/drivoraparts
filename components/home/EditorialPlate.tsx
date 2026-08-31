/**
 * The typographic treatment used wherever a slot has no photograph good
 * enough to earn its place.
 *
 * This exists so "no strong image" is a design decision rather than a hole.
 * A dark plate with a rule and a label reads as deliberate; a weak stock
 * photo of the wrong vehicle reads as a template. The acquisition script
 * marks such slots "below-bar" and the sections render this instead.
 *
 * Drawn entirely from brand tokens and a CSS gradient, so it costs no
 * request and cannot itself become a licensing problem.
 */
export default function EditorialPlate({
  label,
  className = "",
}: {
  /** Short kicker, e.g. "The Workhorse". */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="presentation"
      className={`relative overflow-hidden bg-background-dark ${className}`}
    >
      {/* A shallow diagonal sheen so the plate has depth without pretending
          to be a photograph. */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--surface-dark) 0%, var(--background-dark) 45%, var(--surface-dark) 100%)",
        }}
      />
      {/* Faint horizontal rules — a nod to panel lines, not a texture image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 38px, var(--border-on-dark) 38px 39px)",
        }}
      />
      <div className="relative flex h-full w-full items-end p-6 sm:p-8">
        <div>
          <div className="h-px w-12 bg-accent-on-dark" />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-on-dark">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
