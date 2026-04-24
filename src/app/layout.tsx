import type { Metadata } from "next";
import { Inter, Noto_Serif_JP, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { AppNav } from "@/components/layout/AppNav";
import { TweaksPanel } from "@/components/layout/TweaksPanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kairo — Anime Discover & Identity Terminal",
  description:
    "Kairo is your anime discovery hub and personalised identity terminal — browse trending & airing anime, build your library, and visualise your taste through a stylised Japanese interface.",
  keywords: ["anime", "discover", "profile", "dashboard", "identity", "viewer", "AniList"],
  openGraph: {
    title: "Kairo — Anime Discover & Identity Terminal",
    description: "Browse anime, build your library, and visualise your viewer identity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSerifJP.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <AppNav />
          <TweaksPanel />
          {children}
        </Providers>
      </body>
    </html>
  );
}
