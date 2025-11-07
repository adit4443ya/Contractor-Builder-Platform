import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildConnect - Connect Builders with Contractors",
  description: "A digital marketplace connecting construction builders with verified contractors through a transparent tender bidding system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
