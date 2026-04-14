"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_EXCLUDED_PREFIXES = ["/feed"];

const footerSections = [
  {
    title: "Platform",
    links: [
      { href: "/profile", label: "Profile" },
      { href: "/connections", label: "Connections" },
      { href: "/verification", label: "Verification" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/search", label: "Global Search" },
      { href: "/jobs", label: "Jobs" },
      { href: "/notifications", label: "Notifications" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign In" },
      { href: "/signup", label: "Sign Up" },
      { href: "/in/yash-rana", label: "Public Profiles" },
    ],
  },
];

export const RouteFooter = () => {
  const pathname = usePathname();
  const shouldHideFooter = FOOTER_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="border-t border-surface-300 bg-[#eef3ed]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-trust-700">ZeroTrust Network</p>
          <p className="mt-2 max-w-xs text-sm text-surface-600">
            Trust-first professional networking with verifiable experience, secure messaging, and reputation-backed connections.
          </p>
          <p className="mt-3 text-xs text-surface-500">
            {new Date().getFullYear()} ZeroTrust Network. All rights reserved.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold uppercase tracking-wide text-surface-700">
              {section.title}
            </p>
            <div className="mt-3 space-y-2">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-surface-600 transition-colors duration-200 hover:text-trust-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
};
