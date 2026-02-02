import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVs & Matching | DIS/CREADIS",
  description: "AI-powered CV analysis and consultant matching for DIS/CREADIS",
  keywords: ["CV", "resume", "analysis", "AI", "consultant", "matching", "DIS", "CREADIS"],
  authors: [{ name: "Aria", url: "https://github.com/AriaPrime" }],
  creator: "Aria @ Privateers",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
