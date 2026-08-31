import FooterContent from "./FooterContent";

export default function GlobalFooter() {
  return (
    /*
     * Dark premium treatment. The inset white highlight that suited the old
     * light-grey footer would read as a scratch on charcoal, so it is gone;
     * the top border carries the separation instead.
     */
    <footer className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden border-t border-border-on-dark bg-background-dark text-foreground-on-dark">
      <FooterContent />
    </footer>
  );
}
