"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PortalTab = { href: string; label: string };

export function PortalTabs({
  token,
  tabs,
}: {
  token: string;
  tabs: PortalTab[];
}) {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6">
      {tabs.map((tab) => {
        const href = `/portal/${token}/${tab.href}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.href}
            href={href}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
              active
                ? "border-brand-gold font-medium text-brand-teal"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
