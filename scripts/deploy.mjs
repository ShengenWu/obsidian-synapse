import { existsSync, mkdirSync, copyFileSync, rmSync } from "fs";
import { join, resolve } from "path";

const targetVault = process.argv[2];

if (!targetVault) {
  console.error("❌ Please provide the path to your Obsidian Vault.");
  console.error("Usage: node scripts/deploy.mjs /path/to/your/vault");
  process.exit(1);
}

const pluginDir = join(targetVault, ".obsidian", "plugins", "obsidian-synapse");
const distFiles = ["main.js", "manifest.json", "styles.css"];

console.log(`🚀 Deploying Synapse to: ${pluginDir}`);

try {
  // Ensure target directory exists
  if (!existsSync(pluginDir)) {
    console.log(`📂 Creating plugin directory...`);
    mkdirSync(pluginDir, { recursive: true });
  }

  // Copy files
  distFiles.forEach((file) => {
    const srcPath = resolve(process.cwd(), file);
    const destPath = join(pluginDir, file);

    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file}`);
    } else {
      console.warn(`⚠️  Warning: ${file} not found locally. Build might be incomplete.`);
    }
  });

  console.log(`\n🎉 Deployment Complete!`);
  console.log(`👉 Open Obsidian -> Settings -> Community Plugins -> Reload Plugins`);
  console.log(`👉 Enable 'Synapse'`);
} catch (err) {
  console.error("❌ Deployment Failed:", err);
}
