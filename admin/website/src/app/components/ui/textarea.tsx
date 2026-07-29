import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 disabled:cursor-not-allowed disabled:opacity-50 font-normal shadow-xs resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
