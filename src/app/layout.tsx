import type { Metadata } from "next";
import Link from "next/link";
import { Titillium_Web, Martel_Sans, Overpass } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const titillium = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const martel = Martel_Sans({
  variable: "--font-martel",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Product Traceability",
  description: "Scan a product and view its complete traceability story",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${titillium.variable} ${martel.variable} ${overpass.variable} min-h-screen`}>
        <div className="flex min-h-screen flex-col">
        <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center justify-center">
              <Link
                href="/terms"
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                Terms and Conditions
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
