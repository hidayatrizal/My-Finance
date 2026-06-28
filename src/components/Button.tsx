import React from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black shadow-xl shadow-indigo-600/20 dark:shadow-indigo-900/30 active:scale-[0.98] border border-white/10",
      secondary: "bg-slate-100 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-[0.98] border border-transparent dark:border-white/5",
      outline: "border-2 border-slate-200 dark:border-white/10 bg-transparent text-slate-700 dark:text-zinc-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98]",
      danger: "bg-red-50 text-red-600 font-bold hover:bg-red-100 active:scale-[0.98]",
      ghost: "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300 font-bold active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-10 px-4 text-xs",
      md: "h-14 px-6 text-sm",
      lg: "py-4 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
