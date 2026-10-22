const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'projectsData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Update stage3 heroCard
content = content.replace(
  /heroCard:\s*\{[\s\S]*?aspectRatio:\s*"16:9",?\s*\}/,
  `heroCard: {
      image: "/assets/antigravity/hero-large.jpg",
      title: "From Visual Craft to Technology",
      category: "VISUAL CRAFT | DIGITAL | AI",
      aspectRatio: "16:9",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      description: "A flagship cinematic exploration bridging over a decade of visual craft, 3D motion design, and cutting-edge AI technology — pushing the boundaries of creative digital experiences.",
      isVideoEnabled: true,
    }`
);

// Map of client descriptions
const clientDescriptions = {
  'client-kia': "KIA Dufour is an authorized automotive dealership network in France representing Kia's forward-thinking electric vehicle line-up. Our collaboration focuses on producing high-end digital advertising campaigns, 3D/AI concept automotive visualizations, and promotional marketing collateral for models including the EV2, Sportage, and PBV concepts.",
  'client-hyashop': "HYASHOP is a premier curated fashion and footwear retail brand catering to contemporary streetwear and luxury sneaker enthusiasts. We delivered a series of digital campaigns, visual brand identities, and commercial e-commerce advertising graphics emphasizing premium aesthetics and youth street culture.",
  'client-burger-king': "Burger King is a world-renowned global fast-food brand recognized for bold flavor and playful marketing. We crafted dynamic back-to-school promotional campaign graphics and character-driven digital ad assets featuring the 'Where's Charlie?' collection across multiple social and digital display formats.",
  'client-permifast': "Permifast is a French driver education platform simplifying access to driving licenses and road safety certifications. We designed engaging digital giveaway promotional campaigns, promotional banners, and targeted social media ad creatives driving user registration.",
  'client-xeilos': "Xeilos is a high-growth crypto and algorithmic trading intelligence brand. We provided comprehensive digital marketing visuals, Trading Summit advertising assets, and high-impact futuristic brand graphics tailored to financial tech audiences.",
  'client-adl-finance': "ADL Finance is a modern financial consultancy and wealth management firm. We crafted digital advertising campaigns, investment service promotions, and professional social media collateral designed to build trust and elevate institutional authority.",
  'client-eduf': "EDUF is an international education agency and student mobility consultancy. We developed inspirational digital advertising campaigns, study abroad visual guides, and student enrollment creative assets highlighting academic excellence.",
  'client-withings': "Withings is a pioneer in connected health technology and medical-grade smart devices. We produced clean, minimalist digital advertising campaigns and product showcase visuals highlighting health monitoring innovations and smart lifestyle integration."
};

for (const [clientId, desc] of Object.entries(clientDescriptions)) {
  const regex = new RegExp(`(id:\\s*"${clientId}",[\\s\\S]*?itemsCount:\\s*\\d+,)`, 'g');
  if (regex.test(content)) {
    content = content.replace(regex, `$1\n        description: "${desc.replace(/"/g, '\\"')}",`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated data/projectsData.js');
