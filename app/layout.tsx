import type { Metadata, Viewport } from "next";
import { Darker_Grotesque, Lexend } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const heading = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

const body = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
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
    images: ["/hero/zoe-welcome-team.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E0E0E",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${heading.variable} ${body.variable}`}>
    <body>
      <SiteChrome>{children}</SiteChrome>
    </body>
  </html>;
}
