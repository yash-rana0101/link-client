import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import ProvidersTree from "@/app/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-heading",
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
      className={`${manrope.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="min-h-full text-surface-900 antialiased">
        <ProvidersTree>{children}</ProvidersTree>
      </body>
    </html>
  );
}
