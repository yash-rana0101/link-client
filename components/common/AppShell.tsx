"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren, SVGProps } from "react";
import { Button } from "@/components/ui/Button";
import { NotificationDropdown } from "@/features/notifications/NotificationDropdown";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/cn";
import { setSidebarOpen, toggleSidebar } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type NavIconName =
  | "feed"
  | "connections"
  | "jobs"
  | "messaging"
  | "notifications"
  | "profile";

const navLinks = [
  { href: "/feed", label: "Feed", icon: "feed" as const },
  { href: "/connections", label: "Connections", icon: "connections" as const },
  { href: "/jobs", label: "Jobs", icon: "jobs" as const },
  { href: "/messaging", label: "Messaging", icon: "messaging" as const },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "notifications" as const,
  },
  { href: "/profile", label: "Profile", icon: "profile" as const },
  { href: "/verification", label: "Verification", icon: "profile" as const },
];

const topNavLinks: Array<{ href: string; label: string; icon: NavIconName }> = [
  { href: "/feed", label: "Feed", icon: "feed" },
  { href: "/connections", label: "Connections", icon: "connections" },
  { href: "/jobs", label: "Jobs", icon: "jobs" },
  { href: "/messaging", label: "Messaging", icon: "messaging" },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "notifications",
  },
  { href: "/profile", label: "Profile", icon: "profile" },
];

const IconBase = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  />
);

const NavIcon = ({ name, className }: { name: NavIconName; className?: string }) => {
  if (name === "feed") {
    return (
      <IconBase className={className}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
      </IconBase>
    );
  }

  if (name === "connections") {
    return (
      <IconBase className={className}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16.5" cy="9" r="2.5" />
        <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
        <path d="M13 19a3.5 3.5 0 0 1 7 0" />
      </IconBase>
    );
  }

  if (name === "jobs") {
    return (
      <IconBase className={className}>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M9 7V5h6v2" />
        <path d="M3 12h18" />
      </IconBase>
    );
  }

  if (name === "messaging") {
    return (
      <IconBase className={className}>
        <path d="M4 6h16v11H8l-4 3V6Z" />
      </IconBase>
    );
  }

  if (name === "notifications") {
    return (
      <IconBase className={className}>
        <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </IconBase>
    );
  }

  return (
    <IconBase className={className}>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </IconBase>
  );
};

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

export const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const isFeedRoute = pathname.startsWith("/feed");
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { user, logout, isLoggingOut } = useAuth();
  const userLabel = user?.name ?? user?.email ?? "Trusted User";

  return (
    <div className="min-h-screen bg-app">
      {isFeedRoute ? (
        <header className="sticky top-0 z-40 border-b border-surface-300 bg-[#f4f6f3]/95 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-2.5 sm:px-6">
            <Link href="/feed" className="shrink-0 text-base font-bold text-trust-700 sm:text-lg">
              ZeroTrust Network
            </Link>

            <div className="hidden min-w-55 flex-1 md:block">
              <input
                type="search"
                placeholder="Search trusted network"
                className="h-10 w-full rounded-full border border-surface-300 bg-surface-100 px-4 text-sm text-surface-800 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500"
              />
            </div>

            <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
              {topNavLinks.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group flex min-w-14.5 flex-col items-center rounded-xl px-2 py-1.5 transition-colors duration-200",
                      active
                        ? "bg-trust-100 text-trust-700"
                        : "text-surface-600 hover:bg-surface-200 hover:text-surface-900",
                    )}
                    title={link.label}
                  >
                    <NavIcon name={link.icon} className="h-4.5 w-4.5" />
                    <span className="mt-1 hidden text-[11px] font-medium lg:block">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 xl:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-trust-300 bg-trust-100 text-xs font-semibold text-trust-700">
                {getInitials(userLabel)}
              </div>
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
      ) : (
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
              <p className="hidden text-sm text-surface-600 sm:block">{userLabel}</p>
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
      )}

      {isFeedRoute ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
          <main className="space-y-6">{children}</main>
        </div>
      ) : (
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
      )}
    </div>
  );
};
