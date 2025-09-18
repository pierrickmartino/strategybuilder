import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { i18n } from "@/i18n/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strategy Builder",
  description: "Frontend for the Strategy Builder application"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={i18n.defaultLocale}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
