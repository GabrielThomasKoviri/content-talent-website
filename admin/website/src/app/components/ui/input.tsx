import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 disabled:cursor-not-allowed disabled:opacity-50 font-normal shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
