import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const DEFAULT_TITLE = `${SITE_NAME} — Internships, Jobs & Startups in India`;
const DEFAULT_DESCRIPTION = `InternKhojo connects students with vetted internships, fresher jobs and startups hiring across India. Free for students.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | InternKhojo",
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "InternKhojo — internships, jobs and startups hiring across India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      {
        url: "/Main_logo_white.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/Main_logo_Black.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

// Global entity graph — canonical Organization + WebSite.
// Uses only facts already present in the repo (legal pages + footer):
// operator name, contact email/phone, Delhi address, official socials.
// Page-level WebPage schemas reference this Organization via the same @id
// so entities merge instead of conflicting.
const GLOBAL_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Corvian Ventures LLP",
      alternateName: SITE_NAME,
      url: SITE_URL,
      email: "legal@internkhojo.com",
      telephone: "+918766330925",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Delhi",
        addressLocality: "New Delhi",
        addressRegion: "Delhi",
        postalCode: "110085",
        addressCountry: "IN",
      },
      sameAs: [
        "https://linkedin.com/company/internkhojo",
        "https://www.instagram.com/internkhojo/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_TAGLINE,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/board?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ APPLY GEIST EVERYWHERE */}
      <body className={`${GeistSans.className} bg-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_JSON_LD) }}
        />
        <Navbar />

        <Toaster
          position="top-right"
          gutter={10}
          containerStyle={{
            top: 20,
            right: 20,
          }}
          toastOptions={{
            duration: 3000,
            icon: null,
            style: {
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "14px",
              padding: "9px 12px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              color: "#111827",
              fontSize: "13px",
              fontWeight: "500",
            },
          }}
        />

        <main className="pt-24">{children}</main>

        <Footer />
        <Analytics />
        <GoogleAnalytics gaId="G-ZX9X0CC0FP" />
      </body>
    </html>
  );
}
