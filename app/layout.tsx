import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RouteFooter } from "@/components/common/RouteFooter";
import ProvidersTree from "@/app/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZeroTrust Network",
  description: "Trust-first professional networking client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
    >
      <body className="min-h-full text-surface-900 antialiased">
        <ProvidersTree>{children}</ProvidersTree>
        <RouteFooter />
      </body>
    </html>
  );
}
