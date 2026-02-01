import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Futodama | CV Management",
  description: "Konsulent CV management og analyse platform for DIS/CREADIS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
