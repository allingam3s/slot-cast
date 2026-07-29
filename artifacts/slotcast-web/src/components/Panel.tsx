import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  as?: "div" | "a" | "article";
  href?: string;
  target?: string;
  rel?: string;
}

export function Panel({ children, className, as: Component = "div", ...props }: PanelProps) {
  if (Component === "a") {
    return (
      <a className={cn("panel block text-black no-underline", className)} {...props as any}>
        {children}
      </a>
    );
  }

  return (
    <div className={cn("panel text-black", className)} {...props}>
      {children}
    </div>
  );
}
