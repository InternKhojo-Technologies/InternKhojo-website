import type { Metadata } from "next";

// Authentication page: unique metadata for usability, but never indexed.
export const metadata: Metadata = {
  title: "Create Your InternKhojo Account",
  description:
    "Sign up on InternKhojo as a candidate to find internships and jobs, or as a recruiter to hire early-career talent.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
