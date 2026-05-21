import { ImageResponse } from "next/og";

export const alt = "IT Arena — Technology & Service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #1400D4 0%, #1e3a8a 45%, #312e81 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 40 }}>
          <svg width="72" height="88" viewBox="0 0 64 64" fill="none">
            <circle cx="16" cy="10" r="7" fill="#2D2D38" />
            <circle cx="32" cy="10" r="7" fill="#FFFFFF" />
            <circle cx="48" cy="10" r="7" fill="#2D2D38" />
            <rect x="24" y="22" width="16" height="36" rx="8" fill="#FFFFFF" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 700, opacity: 0.9 }}>IT</span>
            <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>arena</span>
          </div>
        </div>
        <p style={{ fontSize: 36, fontWeight: 600, maxWidth: 900, lineHeight: 1.25, opacity: 0.95 }}>
          Zgjidhje teknologjike për biznesin tuaj në Shqipëri
        </p>
        <p style={{ fontSize: 22, marginTop: 24, opacity: 0.75 }}>
          IT Support · Cloud · CCTV · Rrjet · Software
        </p>
      </div>
    ),
    { ...size }
  );
}
