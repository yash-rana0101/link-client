"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type SVGProps } from "react";
import { ProfileDropdown } from "@/features/auth/ProfileDropdown";
import { useGlobalSearch } from "@/features/search/useSearch";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types/auth";
import { Spinner } from "@/components/ui/Spinner";

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

const QUICK_SEARCH_TERMS = [
  "backend engineer",
  "product manager",
  "bengaluru",
  "cloudnest",
  "security engineer",
];

const toSearchHref = (query: string) => {
  const normalized = query.trim();

  if (!normalized) {
    return "/search";
  }

  return `/search?q=${encodeURIComponent(normalized)}`;
};

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
}: UnifiedNavbarProps) => {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchValue]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!searchContainerRef.current?.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const searchQuery = useGlobalSearch(debouncedSearch, 5, isSearchOpen);
  const hasSearchResults = Boolean(
    searchQuery.data
    && (searchQuery.data.users.length > 0
      || searchQuery.data.jobs.length > 0
      || searchQuery.data.companies.length > 0),
  );

  const goToSearch = (query: string) => {
    setIsSearchOpen(false);
    router.push(toSearchHref(query));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-surface-300 bg-[#f4f6f3]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-2.5 sm:px-6">
        <Link href="/feed" className="shrink-0 text-base font-bold text-trust-700 sm:text-lg">
          ZeroTrust Network
        </Link>

        <div ref={searchContainerRef} className="relative hidden min-w-55 flex-1 md:block">
          <input
            type="search"
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                goToSearch(searchValue);
              }
            }}
            placeholder="Search by people, company, role, or location"
            className="h-10 w-full rounded-full border border-surface-300 bg-surface-100 px-4 text-sm text-surface-800 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500"
          />

          {isSearchOpen ? (
            <div className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-surface-300 bg-white p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-600">
                  Global search
                </p>
                <button
                  type="button"
                  className="text-xs text-surface-500 hover:text-surface-700"
                  onClick={() => goToSearch(searchValue)}
                >
                  Show all
                </button>
              </div>

              {!debouncedSearch ? (
                <div className="space-y-2">
                  <p className="text-xs text-surface-600">Try searching for</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SEARCH_TERMS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        className="rounded-full border border-surface-300 bg-surface-100 px-3 py-1 text-xs text-surface-700 hover:bg-surface-200"
                        onClick={() => {
                          setSearchValue(term);
                          goToSearch(term);
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {searchQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : null}

              {debouncedSearch && !searchQuery.isLoading && searchQuery.isError ? (
                <p className="py-3 text-sm text-surface-600">Search is temporarily unavailable.</p>
              ) : null}

              {debouncedSearch && hasSearchResults && searchQuery.data ? (
                <div className="space-y-3">
                  {searchQuery.data.users.length ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-surface-600">People</p>
                      <ul className="space-y-1">
                        {searchQuery.data.users.slice(0, 3).map((result) => (
                          <li key={result.id}>
                            <Link
                              href={result.publicProfileUrl ? `/in/${result.publicProfileUrl}` : toSearchHref(result.name ?? "")}
                              className="block rounded-lg px-2 py-1.5 hover:bg-surface-100"
                              onClick={() => setIsSearchOpen(false)}
                            >
                              <p className="text-sm font-medium text-surface-900">{result.name ?? "Anonymous professional"}</p>
                              <p className="text-xs text-surface-600">
                                {[result.currentRole, result.location].filter(Boolean).join(" · ") || result.headline || "Profile"}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {searchQuery.data.jobs.length ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-surface-600">Jobs</p>
                      <ul className="space-y-1">
                        {searchQuery.data.jobs.slice(0, 2).map((result) => (
                          <li key={result.id}>
                            <button
                              type="button"
                              className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-surface-100"
                              onClick={() => goToSearch(result.title)}
                            >
                              <p className="text-sm font-medium text-surface-900">{result.title}</p>
                              <p className="text-xs text-surface-600">{result.location ?? "Location flexible"}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {searchQuery.data.companies.length ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-surface-600">Companies</p>
                      <ul className="space-y-1">
                        {searchQuery.data.companies.slice(0, 2).map((result) => (
                          <li key={result.companyName}>
                            <button
                              type="button"
                              className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-surface-100"
                              onClick={() => goToSearch(result.companyName)}
                            >
                              <p className="text-sm font-medium text-surface-900">{result.companyName}</p>
                              <p className="text-xs text-surface-600">{result.memberCount} professionals</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {debouncedSearch && !searchQuery.isLoading && !searchQuery.isError && !hasSearchResults ? (
                <p className="py-3 text-sm text-surface-600">No matches found for this keyword.</p>
              ) : null}
            </div>
          ) : null}
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
                      ? "text-trust-400"
                      : "text-surface-600 hover:text-trust-500",
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
};
