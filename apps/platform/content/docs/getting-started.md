---
title: Getting Started
description: Start building narrative projects in minutes with Forge
---

# Getting Started with Forge

**Choose your path: Use the Studio, build with the Dev-Kit, or join the Developer Program**

Forge offers three ways to get started, depending on your role and needs. Each path gets you to value quickly.

---

## Quick Start Paths

### Path 1: Use Forge Studio (No Code Required)
**Time: 5 minutes | For: Writers, designers, non-technical creators**

Start creating narrative content immediately using our pre-built editors.

**Steps:**

1. **Create an account**
   - Go to [forge.com/login](/login)
   - Sign up with email or SSO
   - Free tier available (no credit card)

2. **Open Forge Studio**
   - Click **Open Studio** in header
   - You'll see the editor dashboard

3. **Choose an editor**
   - **Character Editor** - Create characters and relationships
   - **Dialogue Editor** - Visual dialogue and Yarn Spinner editing
   - **Quest Editor** - Quest chains and dependencies (coming soon)

4. **Create your first project**
   - Click **New Project**
   - Choose a template or start blank
   - Begin creating content

**What you can do:**
- Create characters with relationships
- Write dialogue with visual branching
- Structure narrative (Acts → Chapters → Pages)
- Export to Yarn Spinner for game engines
- Get AI assistance with content generation

**Perfect for:**
- Writers focusing on story, not tools
- Game designers prototyping narratives
- Interactive fiction creators
- Educators building story-driven learning

---

### Path 2: Build with Dev-Kit (React/TypeScript)
**Time: 1 hour | For: Developers building custom editors**

Build your own narrative editors using Forge's component library.

**Steps:**

1. **Install the dev-kit**

```bash
npm install @forge/dev-kit
```

2. **Create your first editor**

```typescript
import {
  EditorShell,
  EditorToolbar,
  EditorDockLayout,
  EditorDockPanel,
} from '@forge/dev-kit';
import { Button } from '@forge/dev-kit/ui';

export function MyEditor() {
  return (
    <EditorShell editorId="my-editor" title="My Custom Editor">
      <EditorToolbar>
        <EditorToolbar.Left>
          <span>My Editor</span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          <Button>New Item</Button>
        </EditorToolbar.Right>
      </EditorToolbar>

      <EditorDockLayout layoutId="my-layout">
        <EditorDockLayout.Main>
          <EditorDockPanel id="main" title="Main View">
            {/* Your custom content here */}
            <div>Your editor UI</div>
          </EditorDockPanel>
        </EditorDockLayout.Main>
      </EditorDockLayout>
    </EditorShell>
  );
}
```

3. **Customize for your domain**
   - Add your domain-specific UI
   - Connect to Forge Platform APIs
   - Integrate AI workflows
   - Add custom panels and tools

4. **Deploy to Forge Platform**
   - Host on Forge infrastructure
   - Get cloud storage automatically
   - Enable team collaboration
   - Access from anywhere

**What you can build:**
- Quest editors with dependency tracking
- Inventory systems with item relationships
- Timeline editors for parallel storylines
- Custom dialogue editors
- Relationship mappers
- Any narrative-focused tool

**Perfect for:**
- Developers who need custom workflows
- Studios building proprietary tools
- Agencies creating client-specific editors
- Technical creators wanting control

**Next steps:**
- Read [Component Documentation](/docs/components)
- Follow [Quick Start Tutorial](/docs/tutorials/quick-start)
- Explore [AI Integration Guide](/docs/tutorials/ai-integration)

---

### Path 3: Developer Program (Monetize Your Work)
**Time: 1 week | For: Tool developers, agencies, studios**

Build custom editors, submit to marketplace, and earn revenue.

**Steps:**

1. **Build your editor** (using Path 2)
   - Create with `@forge/dev-kit`
   - Test with real projects
   - Document features and usage

2. **Prepare submission**
   - Create demo projects
   - Record walkthrough video
   - Write user documentation
   - Take screenshots

3. **Submit for review**
   - Apply via [Developer Portal](/developer-program)
   - Provide submission materials
   - Technical review (1-2 weeks)
   - Quality review (1 week)

4. **Get published**
   - Approved editors listed in Studio marketplace
   - Featured on platform homepage
   - Included in newsletters
   - Start earning revenue

**Revenue model:**
- **70/30 split** - You keep 70%
- **You set pricing** - One-time, subscription, or freemium
- **No upfront costs** - Free to join
- **Passive income** - Earn while you build

**Perfect for:**
- Tool developers monetizing expertise
- Agencies building reusable tools
- Studios with narrative IP to share
- Technical writers creating specialized editors

**Next steps:**
- Read [Developer Program Details](/docs/developer-program)
- Review [Submission Requirements](/docs/developer-program#requirements--guidelines)
- Join [Developer Discord](https://discord.gg/forge-dev)

---

## For Different Audiences

### For Game Studios

**Your challenge:** Track story progress, maintain continuity across large teams, integrate narrative with gameplay

**Forge provides:**
- Yarn Spinner export to Unity/Unreal/Godot
- Team collaboration with role-based access
- Progress tracking (which act? which chapter?)
- AI assistance to fill content gaps
- Context continuity across branches

**Recommended path:**
- Start: Path 1 (Use Studio for prototyping)
- Scale: Path 2 (Build custom quest/dialogue editors)
- Optional: Path 3 (Sell tools to other studios)

**Time saved:** 4-6 months of custom tool development

**ROI example:**
- Custom dialogue tool: 6 months, 3 devs = $180,000
- Forge Team tier: $99/month = $1,188/year
- **Savings: $178,812 first year**

---

### For Interactive Fiction Creators

**Your challenge:** Rich branching narratives, limited technical resources, need export options

**Forge provides:**
- Visual dialogue tree editing
- Storylet management
- Character depth and relationships
- AI-powered content generation
- Export to multiple formats

**Recommended path:**
- Path 1 (Use Studio - no coding needed)

**Time saved:** Weeks of manual tracking and spreadsheet management

**Perfect for:**
- Choice-based narratives
- Branching storylines
- Character-driven stories
- Twine-like projects with more power

---

### For Educational Content Creators

**Your challenge:** Story-driven learning, engagement tracking, creating interactive content

**Forge provides:**
- Learning path structure (Acts = Units, Chapters = Lessons, Pages = Activities)
- Progress tracking built-in
- Character-driven narratives for engagement
- AI tutoring integration
- Team collaboration for multiple educators

**Recommended path:**
- Start: Path 1 (Build courses in Studio)
- Advanced: Path 2 (Custom learning path editors)

**Use cases:**
- Interactive textbooks
- Story-driven tutorials
- Character-based learning
- Branching educational scenarios

---

### For Developers and Tool Builders

**Your challenge:** Build narrative tools fast, monetize expertise, avoid reinventing UI

**Forge provides:**
- Production-ready component library
- Cloud infrastructure included
- AI integration out of the box
- Revenue sharing via Developer Program

**Recommended path:**
- Path 2 (Build with dev-kit)
- Path 3 (Monetize via marketplace)

**Time saved:** 6 months → 1 week

**Revenue potential:**
- Quest editor at $29: 100 sales = $2,030 payout
- Timeline editor at $19/month: 50 subs = $665/month
- Character pack at $9.99: 500 sales = $3,496 payout

---

## What You Get with Forge

### Free Tier
- 1 active project
- Core Studio editors (Character, Dialogue)
- 100 AI requests/month
- Community support
- JSON export

**Perfect for:** Solo creators, prototyping, learning Forge

### Pro Tier - $29/month
- Unlimited projects
- 5,000 AI requests/month
- All export formats (Yarn Spinner, JSON, CSV)
- API access
- Email support (48-hour response)

**Perfect for:** Indie developers, professional creators

### Team Tier - $99/month
- Everything in Pro
- Up to 20 team members
- 20,000 AI requests/month
- Real-time collaboration
- Role-based access control
- Priority support

**Perfect for:** Studios, agencies, collaborative teams

### Enterprise - Custom Pricing
- Everything in Team
- Unlimited team members
- Unlimited AI requests
- Custom export formats
- SSO/SAML
- On-premise option
- Dedicated support + SLA

**Perfect for:** AAA studios, large organizations

[View Full Pricing Details](/docs/pricing)

---

## Common Workflows

### Workflow 1: Indie Game with Unity

1. **Create project in Forge Studio**
   - Use Character Editor for NPCs
   - Use Dialogue Editor for conversations
   - Structure as Acts/Chapters for quest flow

2. **Export to Yarn Spinner**
   - Click Export → Yarn Spinner
   - Download `.yarn` files

3. **Import to Unity**
   - Use Yarn Spinner for Unity plugin
   - Hook up dialogue to game events
   - Test in game

**Time:** Hours instead of weeks

### Workflow 2: Interactive Fiction

1. **Write in Dialogue Editor**
   - Create branching narrative
   - Add character relationships
   - Use storylets for vignettes

2. **Test with AI assistance**
   - AI suggests dialogue branches
   - Generate character responses
   - Check continuity

3. **Export and publish**
   - Export to JSON
   - Build custom web player
   - Or export to Twine format

**Time:** Focus on writing, not tooling

### Workflow 3: Custom Editor Development

1. **Install dev-kit**
   ```bash
   npm install @forge/dev-kit
   ```

2. **Build quest editor**
   - Use Forge components
   - Add quest dependency graph
   - Integrate with Character system

3. **Deploy to team**
   - Host on Forge Platform
   - Share with team members
   - Collaborate in real-time

4. **Optional: Submit to marketplace**
   - Earn 70% revenue
   - Help other developers

**Time:** 1 week vs 6 months custom build

---

## Next Steps by Role

### Writers & Designers
→ [Create Account](/login) and open Studio

### Developers
→ [Install dev-kit](/docs/overview#installation) and build

### Decision Makers
→ [Compare alternatives](/docs/comparison) and evaluate ROI

### Tool Builders
→ [Join Developer Program](/docs/developer-program) and monetize

---

## Resources

### Documentation
- [Platform Features](/docs/platform-features) - What's included
- [Why Forge?](/docs/why-forge) - Value proposition
- [Components](/docs/components) - UI building blocks
- [Tutorials](/docs/tutorials) - Step-by-step guides

### Support
- **Email:** [support@forge.com](mailto:support@forge.com)
- **Discord:** [Community chat](https://discord.gg/forge)
- **Docs:** [Full documentation](/docs)

### Examples
- [Example projects](https://github.com/forge/examples)
- [Component showcase](/docs/components)
- [Video tutorials](https://youtube.com/forge)

---

## Frequently Asked Questions

**Do I need to code to use Forge?**

No. Path 1 (Studio) requires no coding. Path 2 (Dev-Kit) requires React/TypeScript knowledge.

**Can I export my data?**

Yes. Export to Yarn Spinner, JSON, CSV anytime. No lock-in.

**Does Forge replace my game engine?**

No. Forge handles narrative/dialogue/characters. Use Unity, Unreal, Godot, etc. for gameplay and rendering.

**Can I use my own AI models?**

Yes. Forge integrates with OpenRouter. Bring your own API keys or use local models.

**How long does it take to build a custom editor?**

With Forge dev-kit: 1 week. From scratch: 6 months.

**What's the Developer Program revenue split?**

70/30 - you keep 70%, Forge takes 30%.

---

[Get Started Now](/login) • [View Pricing](/docs/pricing) • [Read Docs](/docs) • [Join Developer Program](/docs/developer-program)
