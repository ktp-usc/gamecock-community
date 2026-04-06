"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/admin", label: "Admin" },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200/70 bg-[#f8f6f1]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 md:py-5 lg:px-8">
        <Link href="/" className="shrink-0 self-start md:self-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a251d] sm:text-xs">
            Gamecock Community Shop
          </p>
          <p className="text-base font-semibold text-slate-900 sm:text-lg">
            Volunteer Check-In
          </p>
        </Link>

        <div className="-mx-1 flex w-full min-w-0 items-center gap-1 overflow-x-auto px-1 whitespace-nowrap [scrollbar-width:none] md:mx-0 md:w-auto md:justify-end md:px-0 [&::-webkit-scrollbar]:hidden">
          {navItems.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative shrink-0 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 sm:px-4 after:absolute after:bottom-0 after:left-3 after:h-0.5 after:w-[calc(100%-1.5rem)] after:origin-center after:rounded-full after:bg-[#9a251d] after:transition-transform after:duration-200 sm:after:left-4 sm:after:w-[calc(100%-2rem)]",
                  isActive
                    ? "text-[#9a251d] after:scale-x-100"
                    : "after:scale-x-0 hover:text-slate-950 hover:after:scale-x-100",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
