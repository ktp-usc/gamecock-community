"use client";

import Image from "next/image";
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
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f4f4f4]/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[#f4f4f4]/88">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link
          href="/"
          className="flex w-full min-w-0 items-center gap-3 md:w-auto md:shrink-0"
        >
          <Image
            src="/usc-logos/usc-logo-stacked.png"
            alt="University of South Carolina"
            width={44}
            height={48}
            className="h-auto w-10 shrink-0 sm:w-[44px]"
          />

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a251d] sm:text-xs sm:tracking-[0.28em]">
              Gamecock Community Shop
            </p>
            <p className="truncate text-sm font-semibold text-slate-950 sm:text-lg">
              Volunteer Portal
            </p>
          </div>
        </Link>

        <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm md:flex md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          {navItems.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex min-w-0 items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 md:rounded-none md:px-4 after:absolute after:bottom-0 after:left-3 after:h-0.5 after:w-[calc(100%-1.5rem)] after:origin-center after:rounded-full after:bg-[#7a1c1c] after:transition-transform after:duration-200 md:after:left-4 md:after:w-[calc(100%-2rem)]",
                  isActive
                    ? "bg-[#f8ecec] text-[#7a1c1c] md:bg-transparent after:scale-x-100"
                    : "text-slate-600 after:scale-x-0 hover:bg-slate-50 hover:text-slate-950 md:hover:bg-transparent hover:after:scale-x-100",
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
