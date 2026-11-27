import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VercelAnalytics from "@/components/VercelAnalytics";
import RefCapture from "@/components/RefCapture";
import Gtm, { GtmNoScript } from "@/components/Gtm";
import CookieBanner from "@/components/CookieBanner";
import Mktr from "@/components/Mktr";
import Clarity from "@/components/Clarity";
import { SITE_URL } from "@/lib/env";
import { IS_PROD, JsonLd, organizationLd, websiteLd } from "@/lib/seo";

const geist = Geist({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "600", "700"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Website pe abonament lunar, fără taxă de creare · LUNAR", template: "%s · LUNAR" },
  description:
    "Website pe abonament lunar, fără taxă de creare: design personalizat, hosting și îmbunătățiri incluse. Lansare în 10 zile lucrătoare. Al tău după 12 plăți.",
  applicationName: "LUNAR",
  authors: [{ name: "LUNAR", url: SITE_URL }],
  creator: "LUNAR",
  publisher: "LUNAR",
  category: "business",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: "LUNAR", url: SITE_URL, locale: "ro_RO", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: IS_PROD
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0B0B0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <GtmNoScript />
        <Gtm />
        <JsonLd data={[organizationLd, websiteLd]} />
        {children}
        <VercelAnalytics />
        <RefCapture />
        <CookieBanner />
        <Mktr />
        <Clarity />
      </body>
    </html>
  );
}
