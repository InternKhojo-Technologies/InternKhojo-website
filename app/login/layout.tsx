import type { Metadata } from "next";

// Authentication page: unique metadata for usability, but never indexed.
export const metadata: Metadata = {
  title: "Log in to InternKhojo",
  description:
    "Log in to InternKhojo to manage your applications, track placement practice and access your dashboard.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
