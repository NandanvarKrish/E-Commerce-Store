import type { Metadata } from "next";
import {
  fontAbel,
  fontRobotoMono,
  fontCourgette,
  fontBerkshireSwash,
} from "./fonts";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontAbel.variable} ${fontRobotoMono.variable} ${fontCourgette.variable} ${fontBerkshireSwash.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
