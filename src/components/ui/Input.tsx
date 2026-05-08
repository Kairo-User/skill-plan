"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] border border-transparent focus:border-[var(--primary)] focus:outline-none transition-colors text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] border border-transparent focus:border-[var(--primary)] focus:outline-none transition-colors text-sm resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
