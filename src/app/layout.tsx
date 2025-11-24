import type { Metadata } from "next";
import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nocturne - Spooky Task Manager",
  description: "An elegant, spooky-themed task manager with AI-powered focus sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark theme-minimal">
      <body
        className={`${cinzel.variable} ${crimsonText.variable} font-body antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
