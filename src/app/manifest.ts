import type { MetadataRoute } from "next";
import { SITE_URL, DEFAULT_LOGO_PATH } from "@/lib/seo/config";

export default function manifest(): MetadataRoute.Manifest {
  const logo = `${SITE_URL}${DEFAULT_LOGO_PATH}`;
  return {
    name: "IT Arena",
    short_name: "IT Arena",
    description: "Technology & Service — IT solutions for Albanian businesses",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1400D4",
    icons: [
      {
        src: logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
