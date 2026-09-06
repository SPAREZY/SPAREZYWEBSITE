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
    url: "https://www.sparezy.store",
    siteName: "Sparezy",
    locale: "en_AE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sparezy Auto Spare Parts | Your All Parts Destination",
  },
  // Transparent icon — intentionally blank so the tab shows no logo, and it
  // sits at a new path to override browsers' cached old favicon.
  icons: { icon: "/favicon-blank.png?v=2" },
};

export const viewport: Viewport = {
  // iOS paints the status bar from theme-color, and on a phone set to dark
  // appearance it substitutes a darkened variant unless a dark entry is given
  // too — which is what turned the top of the screen navy. Both entries are the
  // page blue, and color-scheme says outright that this page is light-only.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2B52A8" },
    { media: "(prefers-color-scheme: dark)", color: "#2B52A8" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // Let the page own the safe areas, so its own blue sits behind the status bar
  // rather than iOS painting a band of its own there. .store re-inserts the top
  // inset as padding so the content stays exactly where it was, and the
  // safe-area paddings already in globals.css handle the bottom.
  viewportFit: "cover",
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
