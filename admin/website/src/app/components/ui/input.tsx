import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 font-normal shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
