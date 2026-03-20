import type { Metadata } from "next";
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
      <body className={`${titillium.variable} ${martel.variable} ${overpass.variable}`}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
