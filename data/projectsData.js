export const antigravityData = {
  headerPrompts: {
    badge: "Antigravity Showcase",
    headline: "A place to display your masterpiece.",
    subheadline: "Gateway to artist people. Where motion meets purpose — Selected Works 2015–2026",
  },

  floatingBadges: [
    { id: 1, text: "@motion_design", type: "social", initialPos: { top: "18%", left: "10%" } },
    { id: 2, text: "@howard", type: "social", initialPos: { top: "24%", right: "12%" } },
    { id: 3, text: "repulsion", type: "effect", initialPos: { bottom: "22%", left: "12%" } },
    { id: 4, text: "Pin & Unpin", type: "action", initialPos: { bottom: "20%", right: "14%" } },
  ],

  projects: [
    {
      id: "proj-1",
      promptTitle: "AI Cinematic Advertising",
      promptCategory: "AI Video & Motion",
      year: "2026",
      aspectRatio: "4:5", // 4:5 Instagram Portrait
      coverImage: "/assets/antigravity/preview-2.webp",
      objectFit: "object-cover",
      linkUrl: "#",
      isHero: false,
      baseRotate: -6,
      baseYOffset: 16,
      zIndex: 10,
    },
    {
      id: "proj-2",
      promptTitle: "Neural Brand System",
      promptCategory: "Brand Architecture",
      year: "2026",
      aspectRatio: "1:1", // 1:1 Square (Center Hero Card)
      coverImage: "/assets/antigravity/preview-1.webp",
      objectFit: "object-cover",
      linkUrl: "#",
      isHero: true,
      baseRotate: 0,
      baseYOffset: -18,
      zIndex: 25,
    },
    {
      id: "proj-3",
      promptTitle: "Spatial Prototype & Archive",
      promptCategory: "Visual Design (2015-2024)",
      year: "2025",
      aspectRatio: "4:5", // 4:5 Portrait
      coverImage: "/assets/antigravity/preview-3.webp",
      objectFit: "object-cover",
      linkUrl: "#",
      isHero: false,
      baseRotate: 6,
      baseYOffset: 16,
      zIndex: 12,
    },
    {
      id: "proj-4",
      promptTitle: "3D Motion Identity",
      promptCategory: "3D & VFX",
      year: "2024",
      aspectRatio: "16:9", // Widescreen Archive
      coverImage: "/assets/antigravity/preview-4.webp",
      objectFit: "object-contain",
      linkUrl: "#",
      isHero: false,
      baseRotate: 12,
      baseYOffset: 32,
      zIndex: 8,
    },
  ],
};
