import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VercelAnalytics from "@/components/VercelAnalytics";
import RefCapture from "@/components/RefCapture";
import { SITE_URL } from "@/lib/env";

const geist = Geist({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "600", "700"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LUNAR · Website-ul tău, mai bun lună de lună", template: "%s · LUNAR" },
  description:
    "Website personalizat pe abonament lunar, fără taxă de dezvoltare. Lansare în 10 zile, hosting și îmbunătățiri incluse. Al tău după 12 plăți.",
  alternates: { canonical: "/" },
  openGraph: { siteName: "LUNAR", url: SITE_URL, locale: "ro_RO", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0B0B0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <VercelAnalytics />
        <RefCapture />
      </body>
    </html>
  );
}
