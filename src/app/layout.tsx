import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom and Brew",
  description: "A Next.js app ready to deploy on Leapcell.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
