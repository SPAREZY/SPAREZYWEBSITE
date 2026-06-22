import type { Metadata, Viewport } from "next";
import { Archivo, Archivo_Black, JetBrains_Mono } from "next/font/google";
import Analytics from "@/components/Analytics";
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
  metadataBase: new URL("https://www.sparezy.store"),
  title: {
    default: "Sparezy Auto Spare Parts | Your All Parts Destination",
    template: "%s · Sparezy",
  },
  description:
    "Auto spare parts, batteries, lubricants and body parts for every car — sourced and delivered across the UAE. Common or rare, just ask. Sparezy, Musaffah, Abu Dhabi.",
  keywords: [
    "car parts UAE",
    "auto spare parts Abu Dhabi",
    "car battery UAE",
    "car lubricants and oil UAE",
    "car body parts UAE",
    "spare parts Musaffah",
    "car parts by VIN",
    "genuine OEM car parts UAE",
    "find car parts Dubai",
    "Sparezy",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sparezy Auto Spare Parts | Your All Parts Destination",
    description:
      "Spare parts, batteries, lubricants and body parts for any car in the UAE. No part number? No stress — just ask, we have it.",
    url: "https://www.sparezy.store",
    siteName: "Sparezy",
    locale: "en_AE",
    images: ["/sparezy-logo-white.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sparezy Auto Spare Parts | Your All Parts Destination",
    description: "Spare parts, batteries, lubricants & body parts for any car in the UAE. Just ask, we have it.",
    images: ["/sparezy-logo-white.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2B52A8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="bg-royal text-white font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
