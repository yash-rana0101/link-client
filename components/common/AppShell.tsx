"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/Button";
import { NotificationDropdown } from "@/features/notifications/NotificationDropdown";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/cn";
import { setSidebarOpen, toggleSidebar } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "Profile" },
  { href: "/connections", label: "Connections" },
  { href: "/verification", label: "Verification" },
  { href: "/jobs", label: "Jobs" },
  { href: "/messaging", label: "Messaging" },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-30 border-b border-surface-300 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-surface-300 px-2 py-1 text-sm text-surface-700 lg:hidden"
              onClick={() => dispatch(toggleSidebar())}
            >
              Menu
            </button>
            <Link href="/feed" className="text-lg font-bold text-surface-900">
              ZeroTrust Network
            </Link>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-trust-100 text-trust-700"
                      : "text-surface-600 hover:bg-surface-200 hover:text-surface-900",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <p className="hidden text-sm text-surface-600 sm:block">
              {user?.name ?? user?.email}
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => logout()}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Signing out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside
          className={cn(
            "rounded-2xl border border-surface-300 bg-white p-3 lg:block",
            sidebarOpen ? "block" : "hidden",
          )}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
            Navigation
          </p>
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-trust-100 text-trust-700"
                      : "text-surface-600 hover:bg-surface-100",
                  )}
                  onClick={() => dispatch(setSidebarOpen(false))}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
};
