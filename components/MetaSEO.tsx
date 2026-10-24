"use client";

import React, { useEffect } from "react";
import Head from "next/head";

interface MetaSEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  isAdmin?: boolean;
}

export default function MetaSEO({
  title = "Rizxstudio — Professional Creative, Motion & UI/UX Design Studio",
  description = "Professional creative studio by FOMY with 11+ years of experience specializing in digital advertising, branding, UI/UX, motion graphics, video, and creative production for global clients.",
  ogImage = "/og-image-square.png",
  isAdmin = false,
}: MetaSEOProps) {
  useEffect(() => {
    // Dynamic robots meta tag adjustment for security in Admin Mode
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.name = "robots";
      document.head.appendChild(robotsMeta);
    }

    if (isAdmin) {
      robotsMeta.content = "noindex, nofollow, noarchive, nosnippet";
    } else {
      robotsMeta.content = "index, follow, max-image-preview:large, max-snippet:-1";
    }

    // Googlebot tag
    let googlebotMeta = document.querySelector('meta[name="googlebot"]') as HTMLMetaElement | null;
    if (!googlebotMeta) {
      googlebotMeta = document.createElement("meta");
      googlebotMeta.name = "googlebot";
      document.head.appendChild(googlebotMeta);
    }
    googlebotMeta.content = isAdmin ? "noindex, nofollow" : "index, follow";

    return () => {
      // Cleanup to public indexable state
      if (robotsMeta) robotsMeta.content = "index, follow";
      if (googlebotMeta) googlebotMeta.content = "index, follow";
    };
  }, [isAdmin]);

  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Rizxstudio",
    image: "https://rizxstudio.com/navbar-logo.png",
    "@id": "https://rizxstudio.com",
    url: "https://rizxstudio.com",
    telephone: "+6282381769146",
    priceRange: "$$$",
    founder: {
      "@type": "Person",
      name: "FOMY R",
      jobTitle: "Creative Designer & Motion Specialist",
    },
    description: description,
    sameAs: [
      "https://www.instagram.com/rizxstudio/",
      "https://www.linkedin.com/in/rizxstudio/",
      "https://github.com/rizxstudio",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
