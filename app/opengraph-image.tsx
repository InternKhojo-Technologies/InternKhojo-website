import { ImageResponse } from "next/og";

// Global fallback Open Graph image (1200x630) served at /opengraph-image.
// Brand lockup only — no external assets, always resolves.

export const alt =
  "InternKhojo — internships, jobs and startups hiring across India";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          backgroundColor: "#080808",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-180px",
            right: "-120px",
            width: "560px",
            height: "560px",
            borderRadius: "9999px",
            backgroundColor: "rgba(220,38,38,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-220px",
            left: "-140px",
            width: "480px",
            height: "480px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "0.35em",
            color: "#a1a1aa",
          }}
        >
          INTERNSHIPS • JOBS • BHARAT
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 18,
            fontSize: 124,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          InternKhojo
          <span style={{ color: "#dc2626" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 36,
            fontWeight: 500,
            color: "#d4d4d8",
            lineHeight: 1.3,
          }}
        >
          Standardizing early-career talent pipelines for Bharat.
        </div>
      </div>
    ),
    { ...size },
  );
}
