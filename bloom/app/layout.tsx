import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Bloom",
  description: "Cycle tracking, insights, and gentle predictions",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bloom",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ef7a9a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
