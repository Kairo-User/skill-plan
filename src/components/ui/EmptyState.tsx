interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
