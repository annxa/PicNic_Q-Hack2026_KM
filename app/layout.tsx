import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Picnic+ | Hyperpersonalisiertes Shopping",
  description: "Dein wöchentlicher Einkauf auf Autopilot – personalisiert, nachhaltig, supereinfach.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.variable} bg-[#F8F5F2] min-h-screen`}>
        <div className="phone-frame">
          {children}
        </div>
      </body>
    </html>
  );
}
