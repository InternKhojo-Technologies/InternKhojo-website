import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Job Opportunity — InternKhojo",
    description:
      "Explore this job opportunity, requirements, compensation, and application details on InternKhojo.",
    alternates: {
      canonical: `https://internkhojo.com/find/jobs/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
