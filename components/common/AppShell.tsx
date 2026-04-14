"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { UnifiedNavbar } from "@/components/common/UnifiedNavbar";
import { useAuth } from "@/features/auth/useAuth";

export const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const isFeedRoute = pathname.startsWith("/feed");
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="min-h-screen bg-app">
      <UnifiedNavbar
        pathname={pathname}
        user={user}
        onLogout={logout}
        isLoggingOut={isLoggingOut}
      />

      <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${isFeedRoute ? "py-5" : "py-6"}`}>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
};
