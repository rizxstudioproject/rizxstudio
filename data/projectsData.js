export const antigravityData = {
  // Stage 1: Initial Reveal & Fan-out
  stage1: {
    badge: "03 / SELECTED WORKS",
    headline: "A place to display your masterpiece.",
    subheadline: "Artists can display their masterpieces, and clients can discover high-impact visual design & creative execution.",
    floatingBadges: [
      { id: 1, text: "@coplin", color: "bg-blue-600 text-white border-blue-500", top: "16%", left: "12%" },
      { id: 2, text: "@howard", color: "bg-[#9A2D23] text-white border-red-800", top: "8%", left: "48%" },
      { id: 3, text: "@andrea", color: "bg-[#2E7D5B] text-white border-emerald-600", top: "16%", right: "12%" },
    ],
    deckCards: [
      { id: "d1", title: "Abstract Collage", category: "Art Direction", image: "/assets/antigravity/card-1.webp", gradient: "from-red-600/60 to-black" },
      { id: "d2", title: "Blue Typo Monogram", category: "Visual Identity", image: "/assets/antigravity/card-2.webp", gradient: "from-blue-600/60 to-black" },
      { id: "d3", title: "Yellow Package Box", category: "Branding", image: "/assets/antigravity/card-3.webp", gradient: "from-amber-500/60 to-black" },
      { id: "d4", title: "3D Character Run", category: "3D & Motion", image: "/assets/antigravity/card-4.webp", gradient: "from-pink-500/60 to-black" },
      { id: "d5", title: "Route 66 Pop Art", category: "Campaign Visual", image: "/assets/antigravity/card-5.webp", gradient: "from-cyan-500/60 to-black" },
    ],
  },

  // Stage 2: Showcase, Sell & Acquire (Left Text + Right Overlapping Dense Deck with @howard, @robin)
  stage2: {
    categoryTag: "E-COMMERCE & CAMPAIGNS",
    headline: "Showcase, Sell, & acquire arts to our marketplace.",
    description: "Dynamic community where artists and buyers seamlessly merge. Bringing together creators and global brand enthusiasts to share creativity at scale.",
    badges: [
      { id: 1, text: "@howard", color: "bg-[#9A2D23] text-white border-red-800" },
      { id: 2, text: "@robin", color: "bg-neutral-800 text-white border-neutral-700" },
    ],
    overlappingCards: [
      { id: "o1", title: "Red Spiral Portrait", image: "/assets/antigravity/card-1.webp", offset: -90, rotate: -8 },
      { id: "o2", title: "Inflatable 3D Typo", image: "/assets/antigravity/card-2.webp", offset: -30, rotate: -3 },
      { id: "o3", title: "Tesla Mixed Media", image: "/assets/antigravity/card-3.webp", offset: 30, rotate: 3 },
      { id: "o4", title: "Van Gogh Neural Re-render", image: "/assets/antigravity/card-4.webp", offset: 90, rotate: 7 },
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

  // Stage 4: Our Vision & Grid of Client Work Gallery
  stage4: {
    headline: "Our vision for any creative technology.",
    description: "Every piece of art tells a story. Echoes of expression allow artists and designers to showcase their personal journeys and client campaigns through their work.",
    clientProjects: [
      { id: "c1", title: "Staff Character 3D", category: "Brand Mascot", tag: "Personal", image: "/assets/antigravity/card-1.webp" },
      { id: "c2", title: "Knit by Le Fleur", category: "Fashion Campaign", tag: "Business", image: "/assets/antigravity/card-2.webp" },
      { id: "c3", title: "The Green Knight Poster", category: "Key Art", tag: "Business", image: "/assets/antigravity/card-3.webp" },
      { id: "c4", title: "Limmer Studio Identity", category: "Design System", tag: "Business", image: "/assets/antigravity/card-4.webp" },
      { id: "c5", title: "Fluffy Worm 3D Typography", category: "Motion Type", tag: "Personal", image: "/assets/antigravity/card-5.webp" },
      { id: "c6", title: "Good Stuff Glass Bottle", category: "Packaging 3D", tag: "Business", image: "/assets/antigravity/preview-3.webp" },
    ],
  },
};
