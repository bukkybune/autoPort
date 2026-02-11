import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "AutoPort",
  description: "Turn your GitHub into a portfolio in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        <AppProviders>
          <Navbar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

