import React from "react";
import { cn } from "../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full bg-slate-50 dark:bg-zinc-900/50 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-5 py-3 text-lg font-black outline-none transition-all focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 placeholder:font-medium file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
