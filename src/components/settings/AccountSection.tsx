"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/layout/AuthProvider";

export function AccountSection() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h3 className="font-semibold text-[var(--foreground)] mb-3">账号</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-3">
        当前登录：{user?.email}
      </p>
      <Button variant="danger" size="sm" onClick={signOut}>
        退出登录
      </Button>
    </div>
  );
}
