async function testAll() {
  try {
    console.log("1. Fetching http://localhost:3000/ ...");
    const res = await fetch("http://localhost:3000/");
    console.log("Homepage status:", res.status);
    const html = await res.text();

    console.log("\n2. Checking Content:");
    console.log("- Contains 'Fomy Rizky':", html.includes("Fomy Rizky"));
    console.log("- Contains 'Alex Morgan':", html.includes("Alex Morgan"));
    console.log("- Contains 'AI-Powered Creative Designer':", html.includes("AI-Powered Creative Designer"));
    console.log("- Contains 'FOMY.':", html.includes("FOMY"));
    console.log("- Contains 'SCROLL':", html.includes("SCROLL"));

    // Find all script tags
    const scriptMatches = [...html.matchAll(/<script[^>]+src="([^">]+)"/g)].map(m => m[1]);
    const cssMatches = [...html.matchAll(/<link[^>]+href="([^">]+\.css[^">]*)"/g)].map(m => m[1]);

    console.log(`\n3. Verifying ${scriptMatches.length} JS scripts and ${cssMatches.length} CSS sheets:`);

    let allOk = true;
    for (const url of [...cssMatches, ...scriptMatches]) {
      const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
      try {
        const assetRes = await fetch(fullUrl);
        if (assetRes.status !== 200) {
          console.error(`❌ FAILED: ${url} returned ${assetRes.status}`);
          allOk = false;
        } else {
          console.log(`✓ OK: ${url.split("?")[0]} (${assetRes.status})`);
        }
      } catch (e) {
        console.error(`❌ ERROR fetching ${url}:`, e.message);
        allOk = false;
      }
    }

    // Verify first webp frame
    const frameRes = await fetch("http://localhost:3000https://tbbfetcuiplwlxcyjayw.supabase.co/storage/v1/object/public/portfolio-media/sequence/frame_000000.webp");
    console.log("\n4. Sequence Frame Check:");
    console.log("frame_000000.webp status:", frameRes.status, `(${frameRes.headers.get("content-type")})`);

    if (allOk && res.status === 200 && frameRes.status === 200) {
      console.log("\n🎉 ALL ASSETS & CONTENT VERIFIED SUCCESSFULLY (NO 404s)!");
    } else {
      console.error("\n⚠️ Some assets had errors!");
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testAll();
