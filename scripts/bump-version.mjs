import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const VALID_BUMP_TYPES = new Set(["patch", "minor", "major"]);

const bumpType = process.argv[2];

if (!VALID_BUMP_TYPES.has(bumpType)) {
  console.error("Usage: npm run bump:version -- <patch|minor|major>");
  process.exit(1);
}

const packageJsonPath = resolve("package.json");
const manifestJsonPath = resolve("public/manifest.json");

const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const manifestJson = JSON.parse(await readFile(manifestJsonPath, "utf8"));

const currentVersion = packageJson.version;
const nextVersion = bumpSemver(currentVersion, bumpType);

packageJson.version = nextVersion;
manifestJson.version = nextVersion;

await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
await writeFile(manifestJsonPath, `${JSON.stringify(manifestJson, null, 2)}\n`, "utf8");

console.log(`Version bumped (${bumpType}): ${currentVersion} -> ${nextVersion}`);
console.log("Updated: package.json, public/manifest.json");

function bumpSemver(version, type) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
}
