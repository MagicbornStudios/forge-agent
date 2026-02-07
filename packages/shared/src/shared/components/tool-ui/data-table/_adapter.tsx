/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn           → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 *   Button       → shadcn/ui Button
 *   DropdownMenu → shadcn/ui DropdownMenu
 *   Accordion    → shadcn/ui Accordion
 *   Tooltip      → shadcn/ui Tooltip
 *   Badge        → shadcn/ui Badge
 *   Table        → shadcn/ui Table
 */

export { cn } from "@forge/shared/lib/utils";
export { Button } from "@forge/ui/button";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@forge/ui/dropdown-menu";
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@forge/ui/accordion";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@forge/ui/tooltip";
export { Badge } from "@forge/ui/badge";
export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@forge/ui/table";


