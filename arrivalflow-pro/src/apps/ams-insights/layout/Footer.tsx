export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>© 2026 Asset Management System (AMS)</p>
        <div className="flex items-center gap-4">
          <span>Version 2.0</span>
          <a href="#" className="transition-colors hover:text-primary">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-primary">
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
}
