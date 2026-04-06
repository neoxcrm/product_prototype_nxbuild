import * as React from "react";
import { cn } from "@/lib/utils";

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200", className)}
      {...props}
    />
  ),
);

export const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm font-medium text-slate-700", className)} {...props} />
  ),
);

Avatar.displayName = "Avatar";
AvatarFallback.displayName = "AvatarFallback";
