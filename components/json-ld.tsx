import Script from "next/script";
import { SITE } from "@/lib/content";

export function JsonLd({ locale }: { locale: "hy" | "ru" | "en" }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE.name,
    description:
      "Two A-frame wooden cabins for daily rental in Vardablur, Lori, Armenia.",
    url: `${SITE.url}/${locale}`,
    telephone: SITE.phoneE164,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vardablur",
      addressRegion: "Lori",
      addressCountry: "AM",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.coords.lat,
      longitude: SITE.coords.lng,
    },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Heated jacuzzi",
        value: true,
      },
      { "@type": "LocationFeatureSpecification", name: "Fire pit", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
    ],
  };
  return (
    <Script
      id={`ld-json-${locale}`}
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  );
}
