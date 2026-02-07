import Link from 'next/link';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Developers: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Getting Started', href: '/docs/getting-started' },
    { label: 'Components', href: '/docs/components' },
    { label: 'API Reference', href: '/docs/api-reference' },
  ],
  Company: [
    { label: 'Blog', href: '/blog' },
    { label: 'Waitlist', href: '/waitlist' },
    { label: 'Newsletter', href: '/newsletter' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-muted/20 py-16">
      <div className="container px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="text-xl font-bold">
              Forge
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              AI-first interactive narrative storytelling engine. Build
              branching dialogue, character relationships, and cinematic
              sequences with AI assistance.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Forge. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
            <Link
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
