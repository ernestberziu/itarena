import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1400D4",
        }}
      >
        <svg width="100" height="120" viewBox="0 0 64 64" fill="none">
          <circle cx="16" cy="10" r="7" fill="#FFFFFF" />
          <circle cx="32" cy="10" r="7" fill="#FFFFFF" />
          <circle cx="48" cy="10" r="7" fill="#FFFFFF" />
          <rect x="24" y="22" width="16" height="36" rx="8" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
