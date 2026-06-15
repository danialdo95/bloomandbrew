import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloom & Brew Social",
  description:
    "A Reddit-powered cafe and florist community platform for social media ecosystem analysis.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <Navbar showAdminLink={isAdminUser(user)} />
        {children}
      </body>
    </html>
  );
}
