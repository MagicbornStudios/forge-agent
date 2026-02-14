'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import type { ComponentDemoId } from './generated-ids';
import { ComponentDemoFrame } from './harnesses';

export type AtomDemoId = Extract<ComponentDemoId, `ui.${string}`>;

type DemoRenderer = () => React.JSX.Element;

const CHART_DATA = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 19 },
  { label: 'Wed', value: 16 },
  { label: 'Thu', value: 21 },
  { label: 'Fri', value: 14 },
];

const CHART_CONFIG: UI.ChartConfig = {
  value: {
    label: 'Usage',
    color: 'hsl(var(--primary))',
  },
};

function FormDemo() {
  const form = useForm<{ component: string }>({
    defaultValues: {
      component: 'Button',
    },
  });

  return (
    <ComponentDemoFrame>
      <UI.Form {...form}>
        <form className="space-y-3">
          <UI.FormField
            control={form.control}
            name="component"
            render={({ field }) => (
              <UI.FormItem>
                <UI.FormLabel>Component name</UI.FormLabel>
                <UI.FormControl>
                  <UI.Input placeholder="Component" {...field} />
                </UI.FormControl>
                <UI.FormDescription>
                  Form primitives from @forge/ui/form.
                </UI.FormDescription>
              </UI.FormItem>
            )}
          />
        </form>
      </UI.Form>
    </ComponentDemoFrame>
  );
}

function ColorPickerProxyDemo() {
  const [hue, setHue] = React.useState(220);

  return (
    <ComponentDemoFrame>
      <div className="space-y-3">
        <div
          className="h-20 rounded-md border"
          style={{ background: `hsl(${hue} 70% 52%)` }}
        />
        <UI.Slider
          value={[hue]}
          min={0}
          max={360}
          step={1}
          onValueChange={(values) => setHue(values[0] ?? 0)}
        />
        <UI.Input value={`hsl(${hue}, 70%, 52%)`} readOnly />
      </div>
    </ComponentDemoFrame>
  );
}

function DropzoneProxyDemo() {
  const [fileName, setFileName] = React.useState('No file selected');

  return (
    <ComponentDemoFrame>
      <div className="space-y-3">
        <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          Drag-and-drop surface preview
        </div>
        <UI.Button
          size="sm"
          variant="outline"
          onClick={() => setFileName('story-outline.md')}
        >
          Simulate Upload
        </UI.Button>
        <p className="text-xs text-muted-foreground">{fileName}</p>
      </div>
    </ComponentDemoFrame>
  );
}

function SidebarDemo() {
  return (
    <ComponentDemoFrame className="p-0">
      <UI.SidebarProvider defaultOpen>
        <div className="flex h-[260px] overflow-hidden rounded-md border border-border/70">
          <UI.Sidebar collapsible="none">
            <UI.SidebarHeader>
              <span className="text-xs font-semibold">Docs</span>
            </UI.SidebarHeader>
            <UI.SidebarContent>
              <UI.SidebarMenu>
                <UI.SidebarMenuItem>
                  <UI.SidebarMenuButton isActive>
                    Overview
                  </UI.SidebarMenuButton>
                </UI.SidebarMenuItem>
                <UI.SidebarMenuItem>
                  <UI.SidebarMenuButton>Components</UI.SidebarMenuButton>
                </UI.SidebarMenuItem>
                <UI.SidebarMenuItem>
                  <UI.SidebarMenuButton>Tutorials</UI.SidebarMenuButton>
                </UI.SidebarMenuItem>
              </UI.SidebarMenu>
            </UI.SidebarContent>
          </UI.Sidebar>
          <UI.SidebarInset>
            <div className="p-4 text-xs text-muted-foreground">Sidebar inset content</div>
          </UI.SidebarInset>
        </div>
      </UI.SidebarProvider>
    </ComponentDemoFrame>
  );
}

function SonnerDemo() {
  return (
    <ComponentDemoFrame>
      <div className="space-y-3">
        <UI.Button
          size="sm"
          onClick={() => toast.success('Preview toast from @forge/ui/sonner')}
        >
          Trigger Toast
        </UI.Button>
        <UI.Toaster richColors position="bottom-right" />
      </div>
    </ComponentDemoFrame>
  );
}

const ATOM_DEMOS: Record<AtomDemoId, DemoRenderer> = {
  'ui.accordion': () => (
    <ComponentDemoFrame>
      <UI.Accordion type="single" collapsible className="w-full">
        <UI.AccordionItem value="item-1">
          <UI.AccordionTrigger>What ships in this release?</UI.AccordionTrigger>
          <UI.AccordionContent>
            Audience navigation and complete component previews.
          </UI.AccordionContent>
        </UI.AccordionItem>
      </UI.Accordion>
    </ComponentDemoFrame>
  ),
  'ui.alert': () => (
    <ComponentDemoFrame>
      <UI.Alert>
        <UI.AlertTitle>Documentation update</UI.AlertTitle>
        <UI.AlertDescription>
          Showcase rendering is now connected to live component demos.
        </UI.AlertDescription>
      </UI.Alert>
    </ComponentDemoFrame>
  ),
  'ui.alert-dialog': () => (
    <ComponentDemoFrame>
      <UI.AlertDialog>
        <UI.AlertDialogTrigger asChild>
          <UI.Button size="sm" variant="outline">Open Alert Dialog</UI.Button>
        </UI.AlertDialogTrigger>
        <UI.AlertDialogContent>
          <UI.AlertDialogHeader>
            <UI.AlertDialogTitle>Confirm publish</UI.AlertDialogTitle>
            <UI.AlertDialogDescription>
              This documents the alert dialog primitive.
            </UI.AlertDialogDescription>
          </UI.AlertDialogHeader>
          <UI.AlertDialogFooter>
            <UI.AlertDialogCancel>Cancel</UI.AlertDialogCancel>
            <UI.AlertDialogAction>Continue</UI.AlertDialogAction>
          </UI.AlertDialogFooter>
        </UI.AlertDialogContent>
      </UI.AlertDialog>
    </ComponentDemoFrame>
  ),
  'ui.aspect-ratio': () => (
    <ComponentDemoFrame>
      <UI.AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md border">
        <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
          16:9 viewport
        </div>
      </UI.AspectRatio>
    </ComponentDemoFrame>
  ),
  'ui.audio-player': () => (
    <ComponentDemoFrame>
      <UI.AudioPlayerProvider>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UI.AudioPlayerButton
              size="icon"
              variant="outline"
              item={{
                id: 'preview-track',
                src: UI.exampleTracks[0]?.url ?? 'https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3',
              }}
            />
            <UI.AudioPlayerTime />
            <span className="text-xs text-muted-foreground">/</span>
            <UI.AudioPlayerDuration />
            <UI.AudioPlayerSpeed />
          </div>
          <UI.AudioPlayerProgress />
        </div>
      </UI.AudioPlayerProvider>
    </ComponentDemoFrame>
  ),
  'ui.avatar': () => (
    <ComponentDemoFrame>
      <UI.Avatar>
        <UI.AvatarImage src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=facearea&w=128&h=128&q=80" />
        <UI.AvatarFallback>FA</UI.AvatarFallback>
      </UI.Avatar>
    </ComponentDemoFrame>
  ),
  'ui.badge': () => (
    <ComponentDemoFrame>
      <div className="flex items-center gap-2">
        <UI.Badge>Stable</UI.Badge>
        <UI.Badge variant="secondary">Preview</UI.Badge>
        <UI.Badge variant="outline">Docs</UI.Badge>
      </div>
    </ComponentDemoFrame>
  ),
  'ui.breadcrumb': () => (
    <ComponentDemoFrame>
      <UI.Breadcrumb>
        <UI.BreadcrumbList>
          <UI.BreadcrumbItem>
            <UI.BreadcrumbLink href="#">Docs</UI.BreadcrumbLink>
          </UI.BreadcrumbItem>
          <UI.BreadcrumbSeparator />
          <UI.BreadcrumbItem>
            <UI.BreadcrumbPage>Components</UI.BreadcrumbPage>
          </UI.BreadcrumbItem>
        </UI.BreadcrumbList>
      </UI.Breadcrumb>
    </ComponentDemoFrame>
  ),
  'ui.button': () => (
    <ComponentDemoFrame>
      <div className="flex flex-wrap gap-2">
        <UI.Button size="sm">Primary</UI.Button>
        <UI.Button size="sm" variant="secondary">Secondary</UI.Button>
        <UI.Button size="sm" variant="outline">Outline</UI.Button>
      </div>
    </ComponentDemoFrame>
  ),
  'ui.button-group': () => (
    <ComponentDemoFrame>
      <UI.ButtonGroup>
        <UI.Button variant="outline" size="sm">Left</UI.Button>
        <UI.ButtonGroupSeparator />
        <UI.Button variant="outline" size="sm">Center</UI.Button>
        <UI.ButtonGroupSeparator />
        <UI.Button variant="outline" size="sm">Right</UI.Button>
      </UI.ButtonGroup>
    </ComponentDemoFrame>
  ),
  'ui.card': () => (
    <ComponentDemoFrame>
      <UI.Card className="max-w-sm">
        <UI.CardHeader>
          <UI.CardTitle>Component Card</UI.CardTitle>
          <UI.CardDescription>Reusable card slots.</UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent className="text-sm text-muted-foreground">
          Cards are used throughout platform and editor docs.
        </UI.CardContent>
      </UI.Card>
    </ComponentDemoFrame>
  ),
  'ui.chart': () => (
    <ComponentDemoFrame>
      <UI.ChartContainer config={CHART_CONFIG} className="h-[220px] w-full">
        <BarChart data={CHART_DATA}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={26} />
          <UI.ChartTooltip content={<UI.ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={6} />
        </BarChart>
      </UI.ChartContainer>
    </ComponentDemoFrame>
  ),
  'ui.checkbox': () => (
    <ComponentDemoFrame>
      <label className="flex items-center gap-2 text-sm">
        <UI.Checkbox defaultChecked />
        Include component previews in docs build
      </label>
    </ComponentDemoFrame>
  ),
  'ui.code-block': () => (
    <ComponentDemoFrame>
      <UI.CodeBlock>
        <UI.CodeBlockGroup className="border-b px-3 py-2 text-xs text-muted-foreground">
          component-demo.tsx
        </UI.CodeBlockGroup>
        <UI.CodeBlockCode
          language="tsx"
          code="export function Demo() { return <Button>Preview</Button>; }"
        />
      </UI.CodeBlock>
    </ComponentDemoFrame>
  ),
  'ui.collapsible': () => (
    <ComponentDemoFrame>
      <UI.Collapsible defaultOpen className="space-y-2">
        <UI.CollapsibleTrigger asChild>
          <UI.Button size="sm" variant="outline">Toggle Details</UI.Button>
        </UI.CollapsibleTrigger>
        <UI.CollapsibleContent className="rounded-md border p-3 text-xs text-muted-foreground">
          Collapsible content rendered with Radix primitives.
        </UI.CollapsibleContent>
      </UI.Collapsible>
    </ComponentDemoFrame>
  ),
  'ui.colorpicker': ColorPickerProxyDemo,
  'ui.command': () => (
    <ComponentDemoFrame>
      <UI.Command className="rounded-md border">
        <UI.CommandInput placeholder="Search components..." />
        <UI.CommandList>
          <UI.CommandEmpty>No matches.</UI.CommandEmpty>
          <UI.CommandGroup heading="Components">
            <UI.CommandItem>Button</UI.CommandItem>
            <UI.CommandItem>Card</UI.CommandItem>
            <UI.CommandItem>EditorShell</UI.CommandItem>
          </UI.CommandGroup>
        </UI.CommandList>
      </UI.Command>
    </ComponentDemoFrame>
  ),
  'ui.context-menu': () => (
    <ComponentDemoFrame>
      <UI.ContextMenu>
        <UI.ContextMenuTrigger className="inline-flex rounded-md border px-3 py-2 text-sm">
          Right-click target
        </UI.ContextMenuTrigger>
        <UI.ContextMenuContent>
          <UI.ContextMenuItem>Edit</UI.ContextMenuItem>
          <UI.ContextMenuItem>Duplicate</UI.ContextMenuItem>
        </UI.ContextMenuContent>
      </UI.ContextMenu>
    </ComponentDemoFrame>
  ),
  'ui.dialog': () => (
    <ComponentDemoFrame>
      <UI.Dialog>
        <UI.DialogTrigger asChild>
          <UI.Button size="sm" variant="outline">Open Dialog</UI.Button>
        </UI.DialogTrigger>
        <UI.DialogContent>
          <UI.DialogHeader>
            <UI.DialogTitle>Dialog Preview</UI.DialogTitle>
            <UI.DialogDescription>
              Dialog component rendered inside docs.
            </UI.DialogDescription>
          </UI.DialogHeader>
        </UI.DialogContent>
      </UI.Dialog>
    </ComponentDemoFrame>
  ),
  'ui.drawer': () => (
    <ComponentDemoFrame>
      <UI.Drawer>
        <UI.DrawerTrigger asChild>
          <UI.Button size="sm" variant="outline">Open Drawer</UI.Button>
        </UI.DrawerTrigger>
        <UI.DrawerContent>
          <UI.DrawerHeader>
            <UI.DrawerTitle>Drawer Preview</UI.DrawerTitle>
            <UI.DrawerDescription>Mobile-first surface.</UI.DrawerDescription>
          </UI.DrawerHeader>
        </UI.DrawerContent>
      </UI.Drawer>
    </ComponentDemoFrame>
  ),
  'ui.dropdown-menu': () => (
    <ComponentDemoFrame>
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
          <UI.Button size="sm" variant="outline">Open Menu</UI.Button>
        </UI.DropdownMenuTrigger>
        <UI.DropdownMenuContent>
          <UI.DropdownMenuItem>Open</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Rename</UI.DropdownMenuItem>
          <UI.DropdownMenuSeparator />
          <UI.DropdownMenuItem>Delete</UI.DropdownMenuItem>
        </UI.DropdownMenuContent>
      </UI.DropdownMenu>
    </ComponentDemoFrame>
  ),
  'ui.dropzone': DropzoneProxyDemo,
  'ui.field': () => (
    <ComponentDemoFrame>
      <UI.FieldSet>
        <UI.FieldLegend>Narrative Settings</UI.FieldLegend>
        <UI.Field>
          <UI.FieldLabel>Scene title</UI.FieldLabel>
          <UI.Input placeholder="Opening scene" />
          <UI.FieldDescription>Visible in project overview.</UI.FieldDescription>
        </UI.Field>
      </UI.FieldSet>
    </ComponentDemoFrame>
  ),
  'ui.form': FormDemo,
  'ui.hover-card': () => (
    <ComponentDemoFrame>
      <UI.HoverCard>
        <UI.HoverCardTrigger asChild>
          <UI.Button size="sm" variant="outline">Hover me</UI.Button>
        </UI.HoverCardTrigger>
        <UI.HoverCardContent className="text-xs text-muted-foreground">
          Hover card content preview.
        </UI.HoverCardContent>
      </UI.HoverCard>
    </ComponentDemoFrame>
  ),
  'ui.input': () => (
    <ComponentDemoFrame>
      <UI.Input placeholder="Search documentation" />
    </ComponentDemoFrame>
  ),
  'ui.input-group': () => (
    <ComponentDemoFrame>
      <UI.InputGroup>
        <UI.InputGroupAddon>https://</UI.InputGroupAddon>
        <UI.InputGroupInput placeholder="forge.dev/docs" />
      </UI.InputGroup>
    </ComponentDemoFrame>
  ),
  'ui.item': () => (
    <ComponentDemoFrame>
      <UI.Item>
        <UI.ItemContent>
          <UI.ItemTitle>EditorShell</UI.ItemTitle>
          <UI.ItemDescription>Declarative editor root layout.</UI.ItemDescription>
        </UI.ItemContent>
        <UI.ItemActions>
          <UI.Button size="sm" variant="outline">Open</UI.Button>
        </UI.ItemActions>
      </UI.Item>
    </ComponentDemoFrame>
  ),
  'ui.kbd': () => (
    <ComponentDemoFrame>
      <UI.KbdGroup>
        <UI.Kbd>Ctrl</UI.Kbd>
        <UI.Kbd>K</UI.Kbd>
      </UI.KbdGroup>
    </ComponentDemoFrame>
  ),
  'ui.label': () => (
    <ComponentDemoFrame>
      <div className="space-y-2">
        <UI.Label htmlFor="label-demo-input">Component Name</UI.Label>
        <UI.Input id="label-demo-input" placeholder="Button" />
      </div>
    </ComponentDemoFrame>
  ),
  'ui.locked-overlay': () => (
    <ComponentDemoFrame>
      <div className="relative h-36 overflow-hidden rounded-md border bg-muted">
        <div className="p-4 text-xs text-muted-foreground">Underlying panel content</div>
        <UI.LockedOverlay
          title="Locked during apply"
          description="Tool output is still being applied."
        />
      </div>
    </ComponentDemoFrame>
  ),
  'ui.logo': () => (
    <ComponentDemoFrame>
      <div className="flex items-center gap-3">
        <UI.LogoMark className="size-8" />
        <span className="text-sm font-medium">Forge</span>
      </div>
    </ComponentDemoFrame>
  ),
  'ui.menubar': () => (
    <ComponentDemoFrame>
      <UI.Menubar>
        <UI.MenubarMenu>
          <UI.MenubarTrigger>File</UI.MenubarTrigger>
          <UI.MenubarContent>
            <UI.MenubarItem>New</UI.MenubarItem>
            <UI.MenubarItem>Open</UI.MenubarItem>
          </UI.MenubarContent>
        </UI.MenubarMenu>
      </UI.Menubar>
    </ComponentDemoFrame>
  ),
  'ui.navigation-menu': () => (
    <ComponentDemoFrame>
      <UI.NavigationMenu>
        <UI.NavigationMenuList>
          <UI.NavigationMenuItem>
            <UI.NavigationMenuTrigger>Platform</UI.NavigationMenuTrigger>
            <UI.NavigationMenuContent>
              <div className="p-3 text-xs text-muted-foreground">Platform docs section</div>
            </UI.NavigationMenuContent>
          </UI.NavigationMenuItem>
        </UI.NavigationMenuList>
      </UI.NavigationMenu>
    </ComponentDemoFrame>
  ),
  'ui.pagination': () => (
    <ComponentDemoFrame>
      <UI.Pagination>
        <UI.PaginationContent>
          <UI.PaginationItem>
            <UI.PaginationPrevious href="#" />
          </UI.PaginationItem>
          <UI.PaginationItem>
            <UI.PaginationLink href="#" isActive>
              1
            </UI.PaginationLink>
          </UI.PaginationItem>
          <UI.PaginationItem>
            <UI.PaginationNext href="#" />
          </UI.PaginationItem>
        </UI.PaginationContent>
      </UI.Pagination>
    </ComponentDemoFrame>
  ),
  'ui.popover': () => (
    <ComponentDemoFrame>
      <UI.Popover>
        <UI.PopoverTrigger asChild>
          <UI.Button size="sm" variant="outline">Open Popover</UI.Button>
        </UI.PopoverTrigger>
        <UI.PopoverContent className="text-xs text-muted-foreground">
          Popover content preview.
        </UI.PopoverContent>
      </UI.Popover>
    </ComponentDemoFrame>
  ),
  'ui.pricing-table': () => (
    <ComponentDemoFrame>
      <UI.PricingTable
        title="Plans"
        description="Sample pricing table from @forge/ui."
        plans={[
          {
            id: 'starter',
            title: 'Starter',
            description: 'For prototypes',
            price: '$0',
            features: ['Core docs', 'Basic components'],
            ctaLabel: 'Start',
            ctaHref: '#',
          },
          {
            id: 'pro',
            title: 'Pro',
            description: 'For teams',
            price: '$49',
            features: ['Full showcase', 'Advanced AI tools'],
            ctaLabel: 'Upgrade',
            ctaHref: '#',
            highlight: true,
            badge: 'Popular',
          },
        ]}
      />
    </ComponentDemoFrame>
  ),
  'ui.progress': () => (
    <ComponentDemoFrame>
      <UI.Progress value={72} />
    </ComponentDemoFrame>
  ),
  'ui.radio-group': () => (
    <ComponentDemoFrame>
      <UI.RadioGroup defaultValue="platform" className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <UI.RadioGroupItem value="platform" />
          Platform
        </label>
        <label className="flex items-center gap-2 text-sm">
          <UI.RadioGroupItem value="developer" />
          Developer
        </label>
      </UI.RadioGroup>
    </ComponentDemoFrame>
  ),
  'ui.resizable': () => (
    <ComponentDemoFrame className="p-0">
      <UI.ResizablePanelGroup orientation="horizontal" className="min-h-[170px] rounded-md border">
        <UI.ResizablePanel defaultSize={55}>
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Panel A</div>
        </UI.ResizablePanel>
        <UI.ResizableHandle />
        <UI.ResizablePanel defaultSize={45}>
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Panel B</div>
        </UI.ResizablePanel>
      </UI.ResizablePanelGroup>
    </ComponentDemoFrame>
  ),
  'ui.scroll-area': () => (
    <ComponentDemoFrame>
      <UI.ScrollArea className="h-28 rounded-md border p-2">
        <div className="space-y-2 text-xs">
          {Array.from({ length: 8 }, (_, index) => (
            <p key={index}>Scrollable row {index + 1}</p>
          ))}
        </div>
      </UI.ScrollArea>
    </ComponentDemoFrame>
  ),
  'ui.select': () => (
    <ComponentDemoFrame>
      <UI.Select defaultValue="button">
        <UI.SelectTrigger>
          <UI.SelectValue placeholder="Select component" />
        </UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectItem value="button">Button</UI.SelectItem>
          <UI.SelectItem value="card">Card</UI.SelectItem>
          <UI.SelectItem value="editor-shell">EditorShell</UI.SelectItem>
        </UI.SelectContent>
      </UI.Select>
    </ComponentDemoFrame>
  ),
  'ui.separator': () => (
    <ComponentDemoFrame>
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Top section</p>
        <UI.Separator />
        <p className="text-xs text-muted-foreground">Bottom section</p>
      </div>
    </ComponentDemoFrame>
  ),
  'ui.sheet': () => (
    <ComponentDemoFrame>
      <UI.Sheet>
        <UI.SheetTrigger asChild>
          <UI.Button size="sm" variant="outline">Open Sheet</UI.Button>
        </UI.SheetTrigger>
        <UI.SheetContent>
          <UI.SheetHeader>
            <UI.SheetTitle>Sheet Preview</UI.SheetTitle>
            <UI.SheetDescription>
              Side sheet primitive.
            </UI.SheetDescription>
          </UI.SheetHeader>
        </UI.SheetContent>
      </UI.Sheet>
    </ComponentDemoFrame>
  ),
  'ui.sidebar': SidebarDemo,
  'ui.skeleton': () => (
    <ComponentDemoFrame>
      <div className="space-y-2">
        <UI.Skeleton className="h-4 w-[70%]" />
        <UI.Skeleton className="h-4 w-[40%]" />
      </div>
    </ComponentDemoFrame>
  ),
  'ui.slider': () => (
    <ComponentDemoFrame>
      <UI.Slider defaultValue={[45]} max={100} step={1} />
    </ComponentDemoFrame>
  ),
  'ui.sonner': SonnerDemo,
  'ui.switch': () => (
    <ComponentDemoFrame>
      <label className="flex items-center gap-2 text-sm">
        <UI.Switch defaultChecked />
        Enable docs previews
      </label>
    </ComponentDemoFrame>
  ),
  'ui.table': () => (
    <ComponentDemoFrame>
      <UI.Table>
        <UI.TableHeader>
          <UI.TableRow>
            <UI.TableHead>Component</UI.TableHead>
            <UI.TableHead>Status</UI.TableHead>
          </UI.TableRow>
        </UI.TableHeader>
        <UI.TableBody>
          <UI.TableRow>
            <UI.TableCell>Button</UI.TableCell>
            <UI.TableCell>Stable</UI.TableCell>
          </UI.TableRow>
          <UI.TableRow>
            <UI.TableCell>Thread</UI.TableCell>
            <UI.TableCell>Preview</UI.TableCell>
          </UI.TableRow>
        </UI.TableBody>
      </UI.Table>
    </ComponentDemoFrame>
  ),
  'ui.tabs': () => (
    <ComponentDemoFrame>
      <UI.Tabs defaultValue="platform" className="w-full">
        <UI.TabsList>
          <UI.TabsTrigger value="platform">Platform</UI.TabsTrigger>
          <UI.TabsTrigger value="developer">Developer</UI.TabsTrigger>
        </UI.TabsList>
        <UI.TabsContent value="platform" className="text-xs text-muted-foreground">
          Platform-focused docs content.
        </UI.TabsContent>
        <UI.TabsContent value="developer" className="text-xs text-muted-foreground">
          Developer-focused docs content.
        </UI.TabsContent>
      </UI.Tabs>
    </ComponentDemoFrame>
  ),
  'ui.textarea': () => (
    <ComponentDemoFrame>
      <UI.Textarea rows={4} defaultValue="Describe your workflow..." />
    </ComponentDemoFrame>
  ),
  'ui.toggle': () => (
    <ComponentDemoFrame>
      <UI.Toggle defaultPressed>Bold</UI.Toggle>
    </ComponentDemoFrame>
  ),
  'ui.toggle-group': () => (
    <ComponentDemoFrame>
      <UI.ToggleGroup type="single" defaultValue="center">
        <UI.ToggleGroupItem value="left">Left</UI.ToggleGroupItem>
        <UI.ToggleGroupItem value="center">Center</UI.ToggleGroupItem>
        <UI.ToggleGroupItem value="right">Right</UI.ToggleGroupItem>
      </UI.ToggleGroup>
    </ComponentDemoFrame>
  ),
  'ui.tooltip': () => (
    <ComponentDemoFrame>
      <UI.TooltipProvider>
        <UI.Tooltip>
          <UI.TooltipTrigger asChild>
            <UI.Button size="sm" variant="outline">Hover for tooltip</UI.Button>
          </UI.TooltipTrigger>
          <UI.TooltipContent>
            Native tooltip primitive preview.
          </UI.TooltipContent>
        </UI.Tooltip>
      </UI.TooltipProvider>
    </ComponentDemoFrame>
  ),
  'ui.tooltip-button': () => (
    <ComponentDemoFrame>
      <UI.TooltipButton size="sm" variant="outline" tooltip="Tooltip button">
        Tooltip Button
      </UI.TooltipButton>
    </ComponentDemoFrame>
  ),
};

export function getAtomDemo(id: AtomDemoId): DemoRenderer {
  return ATOM_DEMOS[id];
}
