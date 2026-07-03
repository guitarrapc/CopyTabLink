import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const tagInput = process.argv[2] ?? process.env.TAG;
if (!tagInput) {
  console.error("Usage: npm run verify:release-version -- <tag>");
  console.error("Example: npm run verify:release-version -- v1.2.3");
  process.exit(1);
}
const normalizedTag = `v${tagInput.replace(/^v/, "")}`;
const tagVersion = normalizedTag.slice(1);
const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
const manifestJson = JSON.parse(await readFile(resolve("public/manifest.json"), "utf8"));
const packageVersion = packageJson.version;
const manifestVersion = manifestJson.version;
if (packageVersion !== manifestVersion) {
  console.error(
    `Version mismatch: package.json has '${packageVersion}' but public/manifest.json has '${manifestVersion}'`,
  );
  process.exit(1);
}
if (packageVersion !== tagVersion) {
  console.error(
    `Version mismatch: package.json/public/manifest.json are '${packageVersion}' but tag is '${normalizedTag}'`,
  );
  process.exit(1);
}
console.log(`Version check passed: tag=${normalizedTag}, version=${packageVersion}`);
