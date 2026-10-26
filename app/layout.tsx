import type { Metadata } from "next";
import "./globals.css";
import ContentGuard from "@/components/ContentGuard";
import { LanguageProvider } from "@/context/LanguageContext";
import { PortfolioDataProvider } from "@/context/PortfolioDataContext";
import { MotionThemeProvider } from "@/context/MotionThemeContext";
import CanvasMouseFollower from "@/components/effects/CanvasMouseFollower";
import MotionScrollController from "@/components/effects/MotionScrollController";
import MetaSEO from "@/components/MetaSEO";

export const metadata: Metadata = {
  metadataBase: new URL("https://rizxstudio.com"),
  title: "Rizxstudio — Creative, Motion & UI/UX Design Studio",
  description:
    "Creative studio by FOMY with 11+ years of experience in digital advertising, branding, UI/UX, 3D motion graphics, and video production for global clients.",
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
    title: "Rizxstudio — Creative, Motion & UI/UX Design Studio",
    description:
      "Creative studio by FOMY with 11+ years of experience in digital advertising, branding, UI/UX, 3D motion graphics, and video production for global clients.",
    url: "https://rizxstudio.com",
    siteName: "Rizxstudio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image-square.png",
        width: 1000,
        height: 1000,
        alt: "Rizxstudio — Creative, Motion & UI/UX Design Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizxstudio — Creative, Motion & UI/UX Design Studio",
    description:
      "Creative studio by FOMY with 11+ years of experience in digital advertising, branding, UI/UX, 3D motion graphics, and video production for global clients.",
    images: ["/og-image-square.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-public.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "3gmIFS0RsobGQ6m2I_llFqh8q9R7LYeS5p4jzFSNP5E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('rizx_motion_theme_settings_v2');
                  var mode = saved ? JSON.parse(saved).themeMode : 'dark';
                  if (mode === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#0a0a0a] text-neutral-300 selection:bg-white/20 selection:text-white antialiased min-h-screen relative">
        {/* Subtle cinematic ambient glow / film grain */}
        <div className="fixed inset-0 pointer-events-none z-[999] bg-noise opacity-40" />
        {/* Multi-layer content protection: anti-rightclick, anti-drag, anti-snip */}
        <ContentGuard />
        <MetaSEO isAdmin={false} />
        <LanguageProvider>
          <MotionThemeProvider>
            <PortfolioDataProvider>
              <CanvasMouseFollower />
              <MotionScrollController />
              {children}
            </PortfolioDataProvider>
          </MotionThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
