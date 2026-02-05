# Marketing site components

Lightweight structure: atoms from `@forge/ui`, molecules and organisms in this app. No custom "MarketingButton"; use shadcn primitives directly and compose up.

## Structure

| Layer | Location | Description |
|-------|----------|-------------|
| **Atoms** | `@forge/ui` | Button, Card, Input, Label, etc. Use directly. |
| **Molecules** | `molecules/` | HeroSection, FeatureCard, PricingCard, DocNavSidebar. |
| **Organisms** | `organisms/` | MarketingHeader, PromotionsBanner, MarketingSidebar (logged-in nav). |
| **Providers** | `providers/` | AuthProvider, useAuth. |

## Conventions

- **Doc-heavy:** Docs use DocNavSidebar + markdown; landing uses HeroSection, FeatureCard, PricingCard.
- **Logged-in shell:** When user is set, MarketingSidebar appears next to main (sidebar-08 style).
- **Imports:** Prefer `@/components/molecules`, `@/components/organisms`, `@/components/providers` or direct file imports.

## Usage

```tsx
import { HeroSection, FeatureCard, PricingCard } from '@/components/molecules';
import { MarketingHeader, PromotionsBanner } from '@/components/organisms';
import { AuthProvider, useAuth } from '@/components/providers';
```
