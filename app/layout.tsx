import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lexend } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const sans = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-sans",
});

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
  themeColor: "#152022",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}>
    <body>
      <SiteChrome>{children}</SiteChrome>
    </body>
  </html>;
}
