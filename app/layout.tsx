import type { Metadata, Viewport } from "next";
import { Archivo, Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sparezy.store"),
  title: "Sparezy — Just Ask, We Have It",
  description:
    "Every auto spare part for every car, sourced and delivered across the UAE. Common or rare — just ask, we have it. Sparezy, Musaffah, Abu Dhabi.",
  openGraph: {
    title: "Sparezy — Just Ask, We Have It",
    description:
      "Source any auto part for any car in the UAE. No part number? No stress. Just ask, we have it.",
    images: ["/sparezy-logo-white.png"],
    type: "website",
  },
  icons: { icon: "/sparezy-logo-white.png" },
};

export const viewport: Viewport = {
  themeColor: "#2B52A8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="bg-royal text-white font-sans antialiased">{children}</body>
    </html>
  );
}
