import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatBubble({ children, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed animate-bubble-in",
        "bg-[var(--muted)] text-[var(--foreground)] rounded-bl-md self-start",
        className
      )}
    >
      {children}
    </div>
  );
}
