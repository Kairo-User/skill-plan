import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4",
        onClick && "cursor-pointer hover:border-[var(--primary)] transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
