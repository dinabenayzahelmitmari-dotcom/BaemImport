const path = require("path");
const { spawn } = require("child_process");

const repoRoot = path.join(__dirname, "..");
const frontendDir = path.join(repoRoot, "frontend");
const backendDir = path.join(repoRoot, "backend");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

function run(name, cmd, args, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env },
    shell: isWindows,
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  child.on("error", (err) => {
    console.error(`[dev] ${name} failed: ${err.message}`);
    process.exit(1);
  });

  return child;
}

const backend = run("backend", npmCmd, ["run", "dev"], backendDir);
const frontend = run("frontend", npmCmd, ["start"], frontendDir);

function shutdown() {
  backend.kill();
  frontend.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
