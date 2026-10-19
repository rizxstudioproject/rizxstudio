async function check() {
  try {
    const res = await fetch("http://localhost:3000");
    const html = await res.text();
    console.log("=== RENDERED HOMEPAGE VERIFICATION ===");
    console.log("Status Code:", res.status);
    console.log("Contains 'Fomy R':", html.includes("Fomy R"));
    console.log("Contains 'Alex Morgan':", html.includes("Alex Morgan"));
    console.log("Contains 'Alex':", html.includes("Alex"));
    console.log("Contains 'Morgan':", html.includes("Morgan"));
    console.log("Contains 'AI-Powered Creative Designer':", html.includes("AI-Powered Creative Designer"));
    console.log("Contains '10+ Years Experience':", html.includes("10+"));

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1Match) {
      console.log("Rendered H1 Content:", h1Match[1].replace(/<[^>]*>/g, "").trim());
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    if (titleMatch) {
      console.log("Document Title:", titleMatch[1]);
    }

    if (html.includes("Alex Morgan") || html.includes("Creative Developer & Interaction Architect")) {
      console.error("FAIL: Stale template text detected!");
      process.exit(1);
    } else if (html.includes("Fomy R") && html.includes("AI-Powered Creative Designer")) {
      console.log("SUCCESS: All identity text matches perfectly!");
      process.exit(0);
    } else {
      console.warn("WARNING: Check output above.");
      process.exit(2);
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
    process.exit(1);
  }
}

check();
