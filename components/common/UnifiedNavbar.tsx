"use client";

import Link from "next/link";
import type { SVGProps } from "react";
import { ProfileDropdown } from "@/features/auth/ProfileDropdown";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types/auth";

type NavIconName =
  | "feed"
  | "connections"
  | "jobs"
  | "messaging"
  | "notifications";

interface UnifiedNavbarProps {
  pathname: string;
  user: AuthUser | null | undefined;
  onLogout: () => Promise<unknown>;
  isLoggingOut: boolean;
}

const topNavLinks: Array<{ href: string; label: string; icon: NavIconName }> = [
  { href: "/feed", label: "Home", icon: "feed" },
  { href: "/connections", label: "Connections", icon: "connections" },
  { href: "/jobs", label: "Jobs", icon: "jobs" },
  { href: "/messaging", label: "Messaging", icon: "messaging" },
  {
    href: "/notifications",
    label: "Notifications",
    icon: "notifications",
  },
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

  return (
    <IconBase className={className}>
      <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </IconBase>
  );
};

export const UnifiedNavbar = ({
  pathname,
  user,
  onLogout,
  isLoggingOut,
}: UnifiedNavbarProps) => (
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

      <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
        <nav className="flex items-center gap-0.5 sm:gap-1">
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

        <ProfileDropdown
          user={user}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          triggerVariant="nav-item"
        />
      </div>
    </div>
  </header>
);
