import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-gray-100 min-h-screen">
        <div className="phone-frame shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
