"use client";

import React, { useEffect, useState } from "react";
import { getSeoConfig, SeoConfig, DEFAULT_SEO_CONFIG } from "@/lib/seoService";

interface MetaSEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  isAdmin?: boolean;
}

export default function MetaSEO({
  title,
  description,
  ogImage,
  isAdmin = false,
}: MetaSEOProps) {
  const [config, setConfig] = useState<SeoConfig>(DEFAULT_SEO_CONFIG);

  useEffect(() => {
    // Load dynamic config from Supabase / localStorage
    getSeoConfig().then((cfg) => {
      setConfig(cfg);
    });
  }, []);

  const activeTitle = title || config.metaTitle;
  const activeDesc = description || config.metaDescription;
  const activeOgImage = ogImage || config.ogImage;

  useEffect(() => {
    // Helper to safely set or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(attr) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", name);
        } else {
          el.setAttribute("name", name);
        }
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Helper to safely set link tag
    const setLinkTag = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    if (isAdmin) {
      document.title = "Admin Studio Control Center — Rizxstudio";
      setMetaTag("robots", "noindex, nofollow, noarchive, nosnippet");
      setMetaTag("googlebot", "noindex, nofollow");
    } else {
      document.title = activeTitle;
      setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
      setMetaTag("googlebot", "index, follow");
      setMetaTag("description", activeDesc);
      if (config.keywords) setMetaTag("keywords", config.keywords);
      if (config.authorName) setMetaTag("author", config.authorName);
      if (config.canonicalUrl) setLinkTag("canonical", config.canonicalUrl);

      // Search Console Verifications
      if (config.googleVerification) {
        setMetaTag("google-site-verification", config.googleVerification);
      }
      if (config.bingVerification) {
        setMetaTag("msvalidate.01", config.bingVerification);
      }

      // OpenGraph
      setMetaTag("og:title", activeTitle, true);
      setMetaTag("og:description", activeDesc, true);
      setMetaTag("og:url", config.canonicalUrl || "https://rizxstudio.com", true);
      setMetaTag("og:site_name", config.studioName || "Rizxstudio", true);
      setMetaTag("og:type", "website", true);
      setMetaTag("og:image", activeOgImage, true);

      // Twitter Card
      setMetaTag("twitter:card", "summary_large_image");
      setMetaTag("twitter:title", activeTitle);
      setMetaTag("twitter:description", activeDesc);
      setMetaTag("twitter:image", activeOgImage);
    }
  }, [isAdmin, activeTitle, activeDesc, activeOgImage, config]);

  // Schema.org Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: config.studioName || "Rizxstudio",
    image: config.ogImage ? `${config.canonicalUrl}${config.ogImage}` : `${config.canonicalUrl}/og-image-square.png`,
    "@id": config.canonicalUrl || "https://rizxstudio.com",
    url: config.canonicalUrl || "https://rizxstudio.com",
    telephone: config.telephone || "+6282381769146",
    priceRange: config.priceRange || "$$$",
    founder: {
      "@type": "Person",
      name: config.authorName || "FOMY R",
      jobTitle: "Creative Designer & Motion Specialist",
    },
    description: activeDesc,
    sameAs: [
      "https://www.instagram.com/rizxstudio/",
      "https://www.linkedin.com/in/rizxstudio/",
      "https://github.com/rizxstudio",
    ],
  };

  if (isAdmin || !config.enableRichSnippets) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
