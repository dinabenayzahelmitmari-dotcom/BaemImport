/*
  Production start helper:
  - Ensures `frontend/build` exists (builds it if missing)
  - Starts `backend/server.js` (serves the build + API)

  Rationale: tribunal/professor can run `npm start` once and get a working app on :8080
  without remembering to build the frontend first.
*/

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const repoRoot = path.join(__dirname, "..");
const frontendDir = path.join(repoRoot, "frontend");
const buildDir = path.join(frontendDir, "build");

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", ...opts });
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const nodeCmd = process.execPath;

  if (!fs.existsSync(buildDir)) {
    console.log("[prod] frontend/build no encontrado. Construyendo frontend...");
    await run(npmCmd, ["run", "build"], { cwd: frontendDir });
  }

  console.log("[prod] Arrancando backend...");
  await run(nodeCmd, [path.join(repoRoot, "backend", "server.js")], { cwd: repoRoot });
}

main().catch((e) => {
  console.error("[prod] Error:", e.message || e);
  process.exit(1);
});

