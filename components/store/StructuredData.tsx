// Schema.org structured data so Google can show Sparezy as a local
// auto-parts business (and richer results). Rendered server-side as JSON-LD.
export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "Sparezy Auto Spare Parts",
    image: "https://www.sparezy.store/sparezy-logo-white.png",
    url: "https://www.sparezy.store",
    telephone: "+971522250600",
    email: "gotparts@sparezy.store",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "M7, Musaffah Industrial",
      addressLocality: "Abu Dhabi",
      addressRegion: "Abu Dhabi",
      addressCountry: "AE",
    },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
    sameAs: ["https://wa.me/971522250600"],
    makesOffer: {
      "@type": "Offer",
      name: "The Finder — car parts sourcing",
      description:
        "Send your VIN/chassis and parts list; we source the exact match for your car and deliver across the UAE.",
      price: "0",
      priceCurrency: "AED",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
