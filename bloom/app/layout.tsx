import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloom",
  description: "Cycle tracking, insights, and gentle predictions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${playfair.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
