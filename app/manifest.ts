import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InternKhojo — Internships, Jobs & Startups in India",
    short_name: "InternKhojo",
    description:
      "InternKhojo connects students with vetted internships, fresher jobs and startups hiring across India.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#080808",
    icons: [
      {
        src: "/logo-2.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
