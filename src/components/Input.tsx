import React from "react";
import { cn } from "../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-lg font-bold outline-none focus:ring-2 ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-slate-400 placeholder:font-normal file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
