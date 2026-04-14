"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types/auth";

type TriggerVariant = "nav-item" | "button";

interface ProfileDropdownProps {
  user: AuthUser | null | undefined;
  onLogout: () => Promise<unknown>;
  isLoggingOut: boolean;
  triggerVariant?: TriggerVariant;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 7.5 10 12.5l5-5" />
  </svg>
);

const ProfileShieldIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3 5 6v5c0 4.7 2.8 8.5 7 10 4.2-1.5 7-5.3 7-10V6l-7-3Z" />
    <path d="m9.5 12 1.8 1.8L14.8 10" />
  </svg>
);

const menuSections = {
  account: [
    { label: "Trust & Privacy", href: "/verification" },
    { label: "Security Settings", href: "/profile" },
    { label: "Help Center", href: "/feed" },
  ],
  manage: [
    { label: "Posts & Activity", href: "/profile" },
    { label: "Connections", href: "/connections" },
    { label: "Job Signals", href: "/jobs" },
  ],
};

export const ProfileDropdown = ({
  user,
  onLogout,
  isLoggingOut,
  triggerVariant = "button",
}: ProfileDropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const displayName = user?.name ?? user?.email ?? "Trusted User";
  const displayRole =
    user?.currentRole ?? user?.headline ?? "ZeroTrust professional network member";
  const publicProfileHref = user?.publicProfileUrl ? `/in/${user.publicProfileUrl}` : null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const handleLogoutClick = async () => {
    await onLogout();
    closeMenu();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "transition-colors duration-200",
          triggerVariant === "nav-item"
            ? "group flex min-w-14.5 flex-col items-center rounded-xl px-2 py-1.5 text-surface-600 hover:bg-surface-200 hover:text-surface-900"
            : "inline-flex items-center gap-2 rounded-full border border-surface-300 bg-white px-2 py-1 text-sm text-surface-700 hover:bg-surface-100",
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-trust-200 bg-trust-100 text-xs font-semibold text-trust-700">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </span>
        <span
          className={cn(
            "font-medium",
            triggerVariant === "nav-item" ? "mt-1 text-[11px]" : "text-sm",
          )}
        >
          Me
          <ChevronDownIcon
            className={cn(
              "h-3.5 w-3.5",
              triggerVariant === "nav-item" ? "hidden" : "block",
            )}
          />
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 w-[min(22rem,90vw)] overflow-hidden rounded-2xl border border-surface-300 bg-[#f4f6f3] shadow-xl"
        >
          <div className="p-4">
            <div className="flex items-start gap-3 rounded-xl border border-surface-300 bg-white p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-trust-200 bg-trust-100 text-sm font-semibold text-trust-700">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-lg font-semibold text-surface-900">{displayName}</p>
                  <ProfileShieldIcon className="h-4 w-4 shrink-0 text-trust-600" />
                </div>
                <p className="mt-1 text-sm leading-snug text-surface-700">{displayRole}</p>
              </div>
            </div>

            <Link
              href="/profile"
              onClick={closeMenu}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-trust-500 px-3 py-2 text-base font-semibold text-trust-700 transition-colors duration-200 hover:bg-trust-100"
            >
              View Profile
            </Link>

            {publicProfileHref ? (
              <Link
                href={publicProfileHref}
                onClick={closeMenu}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-surface-300 px-3 py-2 text-base font-semibold text-surface-700 transition-colors duration-200 hover:bg-surface-100"
              >
                View Public Profile
              </Link>
            ) : null}
          </div>

          <div className="border-t border-surface-300 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-surface-900">Account</p>
            <div className="space-y-1">
              {menuSections.account.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-2 py-1.5 text-[15px] text-surface-700 transition-colors duration-200 hover:bg-white hover:text-surface-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-300 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-surface-900">Manage</p>
            <div className="space-y-1">
              {menuSections.manage.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-2 py-1.5 text-[15px] text-surface-700 transition-colors duration-200 hover:bg-white hover:text-surface-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-surface-300 p-3">
            <button
              type="button"
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="w-full rounded-lg px-2 py-2 text-left text-base font-medium text-surface-700 transition-colors duration-200 hover:bg-white hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
