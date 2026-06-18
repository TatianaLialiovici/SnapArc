import type { Metadata } from "next";
import { Italiana, Albert_Sans, PT_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Elegant serif for display titles ("Capturing Aura" feel)
const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-serif",
  display: "swap",
});

// Clean body / UI sans
const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Mono for sub-labels, footer, addresses
const ptMono = PT_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snap Arc | Capturing Light, Licensed Direct",
  description:
    "Snap Arc is a direct photo-license marketplace on Arc Testnet. Capture light, set license terms, get paid instantly. No middlemen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${italiana.variable} ${albertSans.variable} ${ptMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
