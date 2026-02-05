# Marketing components – agent rules

- **Atoms:** Use `@forge/ui` only; do not add new atom wrappers (e.g. no MarketingButton).
- **Molecules:** Reusable composites (HeroSection, FeatureCard, PricingCard, DocNavSidebar). Add new molecules for repeated patterns (e.g. CTA group, testimonial card).
- **Organisms:** Full sections/shells (MarketingHeader, PromotionsBanner, MarketingSidebar). MarketingSidebar is for logged-in users only; uses sidebar-08 block.
- **Layout:** Logged-in layout = Header + Sidebar + main; logged-out = Header + main. See (marketing)/layout and MarketingShell.
