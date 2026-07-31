import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zoehousehold.org"),
  title: {
    default: "Zoe Household | The Life of God, Lived Together",
    template: "%s | Zoe Household",
  },
  description: "Zoe Household is a global, multi-campus church centered on the revelation of Jesus Christ and the life of God lived together.",
  openGraph: {
    type: "website",
    siteName: "Zoe Household",
    images: ["/assets/zoe-hero.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f191b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <body>
      <SiteChrome>{children}</SiteChrome>
    </body>
  </html>;
}
