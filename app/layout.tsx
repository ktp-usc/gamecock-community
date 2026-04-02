import Header from "@/components/header";
import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Future KTP Web App",
  description: "KTP SP26",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-[#f8f6f1]">
        <Navbar />
        <Header />
        {children}
      <Footer />

      </body>
    </html>
  );
}
