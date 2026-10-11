import type { Metadata } from "next";
import { getCompanyById, companyMeta } from "@/lib/server-jobs";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) {
    return {
      title: "Company Profile",
      description:
        "View company details and open internships and jobs on InternKhojo.",
      alternates: {
        canonical: `${SITE_URL}/companies/${id}`,
      },
      robots: { index: false, follow: true },
    };
  }
  const meta = companyMeta(company);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.url,
    },
    openGraph: {
      title: `${meta.title} | InternKhojo`,
      description: meta.description,
      url: meta.url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | InternKhojo`,
      description: meta.description,
    },
  };
}

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);
  const jsonLd = company
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/companies/${company.id}#organization`,
            name: company.name ?? "Company",
            url: `${SITE_URL}/companies/${company.id}`,
            ...(company.description
              ? { description: company.description.slice(0, 500) }
              : {}),
            ...(company.website
              ? {
                  sameAs: [
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`,
                  ],
                }
              : {}),
            ...(company.headquarters
              ? {
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: company.headquarters,
                    addressCountry: "IN",
                  },
                }
              : {}),
          },
          {
            "@type": "WebPage",
            "@id": `${SITE_URL}/companies/${company.id}#webpage`,
            url: `${SITE_URL}/companies/${company.id}`,
            name: `${company.name ?? "Company"} | InternKhojo`,
            about: {
              "@id": `${SITE_URL}/companies/${company.id}#organization`,
            },
          },
        ],
      }
    : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
