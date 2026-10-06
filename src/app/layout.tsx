import type { Metadata, Viewport } from "next";
import { Montserrat, Silkscreen } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const silkscreen = Silkscreen({ variable: "--font-silkscreen", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Second Look · buyer-side condition checks for Fleek",
  description: "Check what arrived against what was listed, piece by piece, and build an evidence-ready dispute pack.",
};

export const viewport: Viewport = { themeColor: "#f8c642" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${silkscreen.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Nav />
        <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-4 sm:px-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-28 text-center text-[11px] text-subtle sm:pb-10">
          Hackathon concept for Fleek · not an official Fleek product · demo photos are synthetic illustrations
        </footer>
      </body>
    </html>
  );
}
