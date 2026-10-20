export const antigravityData = {
  // Stage 1: Initial Reveal & Fan-out
  stage1: {
    badge: "03 / SELECTED WORKS",
    headline: "A Range of Work. One Creative Vision.",
    subheadline: "Explore selected projects across branding, motion, digital design, and AI-driven visuals—shaped by different briefs, teams, and creative challenges.",
    floatingBadges: [],
    deckCards: [
      { id: "d1", title: "Brand Identity", category: "Brand Identity", image: "/assets/antigravity/selected-brand-identity.jpg", gradient: "from-red-600/60 to-black" },
      { id: "d2", title: "Campaign Visuals", category: "Campaign Visuals", image: "/assets/antigravity/selected-campaign-visuals.jpg", gradient: "from-blue-600/60 to-black" },
      { id: "d3", title: "Motion Graphics", category: "Motion Graphics", image: "/assets/antigravity/selected-motion-graphics.jpg", gradient: "from-amber-500/60 to-black" },
      { id: "d4", title: "3D Design", category: "3D Design", image: "/assets/antigravity/selected-3d-design.jpg", gradient: "from-pink-500/60 to-black" },
      { id: "d5", title: "UI/UX Design", category: "UI/UX Design", image: "/assets/antigravity/selected-uiux-design.jpg", gradient: "from-cyan-500/60 to-black" },
    ],
  },

  // Stage 2: AI-Driven Designer Showcase (Left Text + Right Overlapping Dense Deck)
  stage2: {
    categoryTag: "AI-DRIVEN CREATIVE",
    headline: "Design. Motion. AI.",
    description: "Senior Graphic Designer & Digital Artist crafting impactful brand visuals, motion graphics, and digital experiences for global brands.",
    primaryButtonText: "Explore My Work",
    skillLabels: [
      "Branding",
      "Motion",
      "3D Design",
      "UI/UX",
      "AI Visuals",
    ],
    badges: [
      { id: 1, text: "@howard", color: "bg-[#9A2D23] text-white border-red-800" },
      { id: 2, text: "@robin", color: "bg-neutral-800 text-white border-neutral-700" },
    ],
    overlappingCards: [
      { id: "o1", title: "Branding", image: "/assets/antigravity/selected-brand-identity.jpg", offset: -90, rotate: -8 },
      { id: "o2", title: "Motion", image: "/assets/antigravity/selected-motion-graphics.jpg", offset: -30, rotate: -3 },
      { id: "o3", title: "UI/UX", image: "/assets/antigravity/selected-uiux-design.jpg", offset: 30, rotate: 3 },
      { id: "o4", title: "AI Visuals", image: "/assets/antigravity/selected-3d-design.jpg", offset: 90, rotate: 7 },
    ],
  },

  // Stage 3: Gateway to Artist People (Large Cinematic Hero Showcase Card)
  stage3: {
    classTag: "CLASS BY REATHA C. PHELAN",
    headline: "Gateway to artist people.",
    heroCard: {
      image: "/assets/antigravity/hero-large.webp",
      title: "Cinematic Visual Storytelling",
      category: "Creative Direction & AI Film",
      aspectRatio: "16:9",
    },
  },

  // Stage 4: Interactive Client Folders Showcase (Folder per Client + Hasil Kerjaan)
  stage4: {
    headline: "Creative Work. Real-World Thinking.",
    description: "From brand campaigns to digital experiences, I combine design, motion, and AI-driven workflows to create purposeful visuals for brands and businesses.",
    tools: ["Figma", "Blender", "After Effects", "Adobe Creative Cloud", "Affinity", "GPT", "Google AI Studio", "Magnific AI"],
    
    // Client Folders (Masing-masing punya hasil kerjaan di dalamnya)
    clients: [
      {
        id: "client-tokopedia",
        clientName: "Tokopedia",
        category: "E-Commerce Campaign",
        logo: "/logos/logo_01.svg",
        color: "from-emerald-600/30 via-teal-900/20 to-neutral-900",
        itemsCount: 6,
        works: [
          { id: "w-t1", title: "Mega Sale Visuals", type: "Social Ad", image: "/assets/antigravity/card-1.webp", aspect: "4:5" },
          { id: "w-t2", title: "App Promo Motion", type: "Motion Graphic", image: "/assets/antigravity/card-2.webp", aspect: "1:1" },
          { id: "w-t3", title: "Brand Identity Asset", type: "Vector System", image: "/assets/antigravity/card-3.webp", aspect: "4:5" },
          { id: "w-t4", title: "Campaign Key Visual", type: "Art Direction", image: "/assets/antigravity/card-4.webp", aspect: "16:9" },
        ],
      },
      {
        id: "client-samsung",
        clientName: "Samsung",
        category: "Consumer Electronics",
        logo: "/logos/logo_03.svg",
        color: "from-blue-600/30 via-indigo-900/20 to-neutral-900",
        itemsCount: 5,
        works: [
          { id: "w-s1", title: "Galaxy Flagship 3D", type: "3D Product Render", image: "/assets/antigravity/card-4.webp", aspect: "1:1" },
          { id: "w-s2", title: "Digital Ad Banner", type: "Performance Ad", image: "/assets/antigravity/card-5.webp", aspect: "4:5" },
          { id: "w-s3", title: "Event Launch Visual", type: "Key Visual", image: "/assets/antigravity/card-1.webp", aspect: "16:9" },
        ],
      },
      {
        id: "client-11st",
        clientName: "11ST",
        category: "Global Retail",
        logo: "/logos/logo_02.svg",
        color: "from-red-600/30 via-rose-900/20 to-neutral-900",
        itemsCount: 4,
        works: [
          { id: "w-11-1", title: "Holiday Festival", type: "Social Media Campaign", image: "/assets/antigravity/card-2.webp", aspect: "1:1" },
          { id: "w-11-2", title: "Discount Typography", type: "Graphic Design", image: "/assets/antigravity/card-3.webp", aspect: "4:5" },
        ],
      },
      {
        id: "client-bukopin",
        clientName: "KB Bukopin",
        category: "Banking & Finance",
        logo: "/logos/logo_20.svg",
        color: "from-amber-600/30 via-yellow-900/20 to-neutral-900",
        itemsCount: 4,
        works: [
          { id: "w-b1", title: "Financial App UI", type: "Mobile UI/UX", image: "/assets/antigravity/card-1.webp", aspect: "1:1" },
          { id: "w-b2", title: "Digital Banking Video", type: "Motion Prototype", image: "/assets/antigravity/card-4.webp", aspect: "4:5" },
        ],
      },
    ],
  },
};
