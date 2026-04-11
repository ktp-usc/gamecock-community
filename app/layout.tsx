import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import React from "react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Gamecock CommUnity Shop Volunteer Tracker",
  description: "CommUnity Shop Volunteer Tracker % Tutorial",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} flex min-h-screen flex-col overflow-x-hidden bg-[#f4f4f4] font-[family:var(--font-manrope)] text-slate-950 antialiased`}
      >
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
