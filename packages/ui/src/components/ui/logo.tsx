import * as React from "react";
import { Hexagon } from "lucide-react";

export function LogoMark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return <Hexagon className={className} aria-hidden {...props} />;
}
