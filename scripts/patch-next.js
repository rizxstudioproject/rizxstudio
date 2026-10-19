const fs = require("fs");
const path = require("path");

// 1. Patch flight-manifest-plugin.js to register clientModules with and without null bytes (\0#)
const flightPluginPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "build",
  "webpack",
  "plugins",
  "flight-manifest-plugin.js"
);

if (fs.existsSync(flightPluginPath)) {
  let content = fs.readFileSync(flightPluginPath, "utf8");

  if (!content.includes("cleanExportName")) {
    content = content.replace(
      /function addClientReference\(\) \{[\s\S]*?manifest\.clientModules\[exportName\] = \{[\s\S]*?\};[\s\S]*?if \(esmResource\) \{[\s\S]*?manifest\.clientModules\[edgeExportName\] = manifest\.clientModules\[exportName\];[\s\S]*?\}[\s\S]*?\}/,
      `function addClientReference() {
                    const exportName = resource;
                    const cleanExportName = resource.replace(/\\0/g, "");
                    manifest.clientModules[exportName] = {
                        id: modId,
                        name: "*",
                        chunks: requiredChunks,
                        async: isAsyncModule
                    };
                    manifest.clientModules[cleanExportName] = manifest.clientModules[exportName];
                    if (esmResource) {
                        const edgeExportName = esmResource;
                        const cleanEdgeExportName = esmResource.replace(/\\0/g, "");
                        manifest.clientModules[edgeExportName] = manifest.clientModules[exportName];
                        manifest.clientModules[cleanEdgeExportName] = manifest.clientModules[exportName];
                    }
                }`
    );

    content = content.replace(
      /function addSSRIdMapping\(\) \{\s*const exportName = resource;/,
      `function addSSRIdMapping() {
                    const exportName = resource.replace(/\\0/g, "");`
    );

    fs.writeFileSync(flightPluginPath, content, "utf8");
    console.log("Patched flight-manifest-plugin.js successfully");
  } else {
    console.log("flight-manifest-plugin.js already patched");
  }
}

// 2. Patch next-trace-entrypoints-plugin.js to sanitize paths containing \\0
const tracePluginPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "build",
  "webpack",
  "plugins",
  "next-trace-entrypoints-plugin.js"
);

if (fs.existsSync(tracePluginPath)) {
  let content = fs.readFileSync(tracePluginPath, "utf8");

  if (!content.includes("path = typeof path === 'string' ? path.replace(/\\0/g, '') : path;")) {
    content = content.replace(
      /const readlink = async \(path\)=>\{/,
      `const readlink = async (path)=>{
                path = typeof path === 'string' ? path.replace(/\\0/g, '') : path;`
    );

    content = content.replace(
      /const stat = async \(path\)=>\{/,
      `const stat = async (path)=>{
                path = typeof path === 'string' ? path.replace(/\\0/g, '') : path;`
    );

    fs.writeFileSync(tracePluginPath, content, "utf8");
    console.log("Patched next-trace-entrypoints-plugin.js successfully");
  } else {
    console.log("next-trace-entrypoints-plugin.js already patched");
  }
}
