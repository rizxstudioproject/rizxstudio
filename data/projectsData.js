export const antigravityData = {
  headerPrompts: {
    badge: "Antigravity Showcase",
    headline: "A place to display your masterpiece.",
    subheadline: "Where Motion Meets Purpose — Selected Works 2015–2026",
  },

  floatingBadges: [
    { id: 1, text: "@rizxstudio", type: "social", icon: "✦" },
    { id: 2, text: "✨ Motion & Visuals", type: "skill" },
    { id: 3, text: "🎨 Brand Identity", type: "skill" },
    { id: 4, text: "⚡ 3D & VFX", type: "skill" },
    { id: 5, text: "🟢 Available for Projects", type: "status" },
  ],

  projects: [
    {
      id: "proj-1",
      promptTitle: "Ning App",
      promptCategory: "UI/UX Design",
      year: "2026",
      aspectRatio: "1:1", // 1:1 Square
      coverImage: "/assets/antigravity/ning-app.jpg",
      gradient: "from-blue-600/30 via-cyan-500/10 to-transparent",
      linkUrl: "#",
      isHero: true,
      description: "Tactile spatial design system with fluid dynamic micro-interactions.",
      tags: ["Figma", "UI/UX", "Motion Prototype"],
    },
    {
      id: "proj-2",
      promptTitle: "3D Isometric Scene",
      promptCategory: "Motion & 3D",
      year: "2025",
      aspectRatio: "4:5", // 4:5 Instagram Portrait
      coverImage: "/assets/antigravity/3d-isometric.jpg",
      gradient: "from-purple-600/30 via-pink-500/10 to-transparent",
      linkUrl: "#",
      isHero: true,
      description: "Cinematic lighting setup & generative 3D environment for brand storytelling.",
      tags: ["Blender", "Octane", "3D Art"],
    },
    {
      id: "proj-3",
      promptTitle: "Branding Showcase",
      promptCategory: "Visual Identity",
      year: "2024",
      aspectRatio: "16:9", // 16:9 Landscape
      coverImage: "/assets/antigravity/branding-archive.jpg",
      gradient: "from-amber-600/30 via-orange-500/10 to-transparent",
      linkUrl: "#",
      isHero: false,
      description: "Comprehensive visual language, tokens, and scalable vector guidelines.",
      tags: ["Brand Identity", "Typography", "Art Direction"],
    },
    {
      id: "proj-4",
      promptTitle: "AI Cinematic Video",
      promptCategory: "AI Advertising",
      year: "2026",
      aspectRatio: "4:5",
      coverImage: "/assets/antigravity/ai-video.jpg",
      gradient: "from-emerald-600/30 via-teal-500/10 to-transparent",
      linkUrl: "#",
      isHero: false,
      description: "Multimodal AI advertising pipeline with neural color grading.",
      tags: ["Midjourney", "Runway", "After Effects"],
    },
  ],
};
