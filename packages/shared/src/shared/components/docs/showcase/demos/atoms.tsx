'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from './harnesses';

type DemoRenderer = () => React.JSX.Element;

function ThemeSwitcherDemo() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  return (
    <ShowcaseDemoSurface>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UI.Badge variant="outline">Theme</UI.Badge>
          <UI.Button
            size="sm"
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            Light
          </UI.Button>
          <UI.Button
            size="sm"
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </UI.Button>
        </div>
        <p className="text-xs text-muted-foreground">Selected theme: {theme}</p>
      </div>
    </ShowcaseDemoSurface>
  );
}

function DensityDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="grid gap-4 md:grid-cols-2">
        <div data-density="compact" className="space-y-2 rounded-md border bg-background p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Compact</p>
          <UI.Button size="sm">Save</UI.Button>
          <UI.Input placeholder="Compact input" />
        </div>
        <div data-density="comfortable" className="space-y-2 rounded-md border bg-background p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comfortable</p>
          <UI.Button>Save</UI.Button>
          <UI.Input placeholder="Comfortable input" />
        </div>
      </div>
    </ShowcaseDemoSurface>
  );
}

function BadgeDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="flex flex-wrap gap-2">
        <UI.Badge>Default</UI.Badge>
        <UI.Badge variant="secondary">Secondary</UI.Badge>
        <UI.Badge variant="outline">Outline</UI.Badge>
        <UI.Badge variant="destructive">Destructive</UI.Badge>
      </div>
    </ShowcaseDemoSurface>
  );
}

function ButtonDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="flex flex-wrap gap-2">
        <UI.Button>Default</UI.Button>
        <UI.Button variant="secondary">Secondary</UI.Button>
        <UI.Button variant="outline">Outline</UI.Button>
        <UI.Button variant="ghost">Ghost</UI.Button>
      </div>
    </ShowcaseDemoSurface>
  );
}

function CardDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Card className="max-w-sm">
        <UI.CardHeader>
          <UI.CardTitle>Card title</UI.CardTitle>
          <UI.CardDescription>Reusable content shell.</UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent>
          <p className="text-sm text-muted-foreground">Main content goes here.</p>
        </UI.CardContent>
      </UI.Card>
    </ShowcaseDemoSurface>
  );
}

function DialogDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Dialog>
        <UI.DialogTrigger asChild>
          <UI.Button variant="outline">Open dialog</UI.Button>
        </UI.DialogTrigger>
        <UI.DialogContent>
          <UI.DialogHeader>
            <UI.DialogTitle>Dialog title</UI.DialogTitle>
            <UI.DialogDescription>A short description for dialog content.</UI.DialogDescription>
          </UI.DialogHeader>
        </UI.DialogContent>
      </UI.Dialog>
    </ShowcaseDemoSurface>
  );
}

function DropdownMenuDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
          <UI.Button variant="outline">Open menu</UI.Button>
        </UI.DropdownMenuTrigger>
        <UI.DropdownMenuContent>
          <UI.DropdownMenuItem>New file</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Open</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Save</UI.DropdownMenuItem>
        </UI.DropdownMenuContent>
      </UI.DropdownMenu>
    </ShowcaseDemoSurface>
  );
}

function InputDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="flex max-w-sm flex-col gap-3">
        <UI.Input placeholder="Enter text..." />
        <UI.Input type="email" placeholder="name@example.com" />
      </div>
    </ShowcaseDemoSurface>
  );
}

function LabelDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="grid max-w-sm gap-2">
        <UI.Label htmlFor="docs-label-demo">Email</UI.Label>
        <UI.Input id="docs-label-demo" type="email" placeholder="name@example.com" />
      </div>
    </ShowcaseDemoSurface>
  );
}

function SelectDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Select defaultValue="apple">
        <UI.SelectTrigger className="w-[180px]">
          <UI.SelectValue placeholder="Choose fruit" />
        </UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectItem value="apple">Apple</UI.SelectItem>
          <UI.SelectItem value="banana">Banana</UI.SelectItem>
          <UI.SelectItem value="cherry">Cherry</UI.SelectItem>
        </UI.SelectContent>
      </UI.Select>
    </ShowcaseDemoSurface>
  );
}

function SwitchDemo() {
  const [checked, setChecked] = React.useState(false);
  return (
    <ShowcaseDemoSurface>
      <div className="flex items-center gap-2">
        <UI.Switch id="docs-switch-demo" checked={checked} onCheckedChange={setChecked} />
        <UI.Label htmlFor="docs-switch-demo">{checked ? 'On' : 'Off'}</UI.Label>
      </div>
    </ShowcaseDemoSurface>
  );
}

function TabsDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Tabs defaultValue="tab1" className="w-full">
        <UI.TabsList>
          <UI.TabsTrigger value="tab1">Tab 1</UI.TabsTrigger>
          <UI.TabsTrigger value="tab2">Tab 2</UI.TabsTrigger>
          <UI.TabsTrigger value="tab3">Tab 3</UI.TabsTrigger>
        </UI.TabsList>
        <UI.TabsContent value="tab1" className="rounded border border-border p-4">
          Content for tab 1
        </UI.TabsContent>
        <UI.TabsContent value="tab2" className="rounded border border-border p-4">
          Content for tab 2
        </UI.TabsContent>
        <UI.TabsContent value="tab3" className="rounded border border-border p-4">
          Content for tab 3
        </UI.TabsContent>
      </UI.Tabs>
    </ShowcaseDemoSurface>
  );
}

function AccordionDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Accordion type="single" collapsible className="w-full">
        <UI.AccordionItem value="item-1">
          <UI.AccordionTrigger>What ships in this release?</UI.AccordionTrigger>
          <UI.AccordionContent>
            Bug fixes, performance improvements, and the new Accordion component.
          </UI.AccordionContent>
        </UI.AccordionItem>
        <UI.AccordionItem value="item-2">
          <UI.AccordionTrigger>How do I install?</UI.AccordionTrigger>
          <UI.AccordionContent>
            Run <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm install</code> from the
            project root.
          </UI.AccordionContent>
        </UI.AccordionItem>
      </UI.Accordion>
    </ShowcaseDemoSurface>
  );
}

export const ATOM_SHOWCASE_DEMOS: Record<string, DemoRenderer> = {
  'accordion-demo': AccordionDemo,
  'theme-switcher-demo': ThemeSwitcherDemo,
  'density-demo': DensityDemo,
  'badge-demo': BadgeDemo,
  'button-demo': ButtonDemo,
  'card-demo': CardDemo,
  'dialog-demo': DialogDemo,
  'dropdown-menu-demo': DropdownMenuDemo,
  'input-demo': InputDemo,
  'label-demo': LabelDemo,
  'select-demo': SelectDemo,
  'switch-demo': SwitchDemo,
  'tabs-demo': TabsDemo,
};

