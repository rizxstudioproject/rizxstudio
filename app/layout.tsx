import type { Metadata } from "next";
import "./globals.css";
import ContentGuard from "@/components/ContentGuard";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://rizxstudio.com"),
  title: "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio",
  description:
    "Professional creative studio by FOMY with 11+ years of experience specializing in digital advertising, branding, UI/UX, motion graphics, video, and creative production for global clients.",
  keywords: [
    "Rizxstudio",
    "FOMY",
    "Fomy R",
    "Creative Designer",
    "Motion Specialist",
    "Digital Advertising",
    "Branding",
    "UI/UX Design",
    "Motion Graphics",
    "Video Production",
    "Creative Production",
  ],
  openGraph: {
    title: "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio",
    description:
      "Professional creative studio by FOMY with 11+ years of experience specializing in digital advertising, branding, UI/UX, motion graphics, video, and creative production for global clients.",
    url: "https://rizxstudio.com",
    siteName: "Rizxstudio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image-square.png",
        width: 1024,
        height: 1024,
        alt: "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio",
    description:
      "Professional creative studio by FOMY with 11+ years of experience specializing in digital advertising, branding, UI/UX, motion graphics, video, and creative production for global clients.",
    images: ["/og-image-square.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-neutral-300 selection:bg-white/20 selection:text-white antialiased min-h-screen relative">
        {/* Subtle cinematic ambient glow / film grain */}
        <div className="fixed inset-0 pointer-events-none z-[999] bg-noise opacity-40" />
        {/* Multi-layer content protection: anti-rightclick, anti-drag, anti-snip */}
        <ContentGuard />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
