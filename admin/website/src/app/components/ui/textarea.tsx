import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 font-normal shadow-xs resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
