import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "InternKhojo",
  description: "Find internships, jobs & freelancers",
  icons: {
    icon: [
      {
        url: "/IK New White logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/IK New Black logo.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
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
      </body>
    </html>
  );
}
