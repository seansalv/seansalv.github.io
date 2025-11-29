import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sean Salvador | Portfolio",
  description:
    "Portfolio of Sean Salvador — Software Engineer, Roblox scripter, and systems builder.",
  metadataBase: new URL("https://seansalv.dev"),
  openGraph: {
    title: "Sean Salvador | Portfolio",
    description:
      "Projects across backend systems, Roblox gameplay scripting, and CS research.",
    url: "https://seansalv.dev",
    siteName: "Sean Salvador Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
