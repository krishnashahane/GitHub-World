import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Github World",
    short_name: "Github World",
    description:
      "Visualize GitHub as a living 3D universe — developers as planets, repos as moons, commits as orbital energy.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#4ADE80",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
