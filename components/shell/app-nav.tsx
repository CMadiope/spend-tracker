"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/forecast", label: "Forecast" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-header md:sticky md:top-0 md:h-dvh md:border-t-0 md:border-r"
    >
      <p className="hidden px-6 pt-6 pb-4 text-lg font-semibold text-header-text md:block">
        Spend Tracker
      </p>
      <ul className="grid grid-cols-4 md:flex md:flex-col md:gap-1 md:px-3">
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`block px-2 py-4 text-center text-sm font-medium md:px-3 md:py-2.5 md:text-left ${
                  active
                    ? "bg-accent text-accent-text"
                    : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
