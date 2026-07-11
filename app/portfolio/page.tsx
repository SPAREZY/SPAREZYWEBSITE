import type { Metadata } from "next";
import PortfolioApp from "@/components/portfolio/PortfolioApp";

// Personal dashboard — keep it out of search engines.
export const metadata: Metadata = {
  title: "Real Estate Portfolio",
  robots: { index: false, follow: false },
};

export default function PortfolioPage() {
  return (
    <main className="min-h-dvh bg-royal">
      <PortfolioApp />
    </main>
  );
}
