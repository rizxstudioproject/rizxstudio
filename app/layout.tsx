import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fomy R — AI-Powered Creative Designer | Antigravity Portfolio",
  description:
    "Flawless, cinematic scrollytelling portfolio of Fomy R — AI-Powered Creative Designer with 10+ years experience specializing in AI advertising, branding, UI/UX, motion graphics, video, and AI-assisted creative production.",
  keywords: [
    "Fomy R",
    "Fomy Rizky",
    "AI-Powered Creative Designer",
    "AI Advertising",
    "Graphic Design",
    "Branding",
    "UI/UX",
    "Motion Graphics",
    "Video Production",
    "Generative AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#0a0a0a] text-neutral-300 selection:bg-white/20 selection:text-white antialiased min-h-screen relative">
        {/* Subtle cinematic ambient glow / film grain */}
        <div className="fixed inset-0 pointer-events-none z-[999] bg-noise opacity-40" />
        {children}
      </body>
    </html>
  );
}
