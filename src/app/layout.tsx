import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgriGo | Climate-Aware Agriculture Intelligence",
  description: "Predict Crop Yield Before the Season Decides It",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0F2A1D] text-[#F5F7F2]`}>
        {children}
      </body>
    </html>
  );
}