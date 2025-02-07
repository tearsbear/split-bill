import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Split Bill Calculator",
  description:
    "A simple and efficient way to split bills among friends with receipt scanning capability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1 pb-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
