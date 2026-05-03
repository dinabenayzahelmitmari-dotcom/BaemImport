const { spawn } = require("child_process");
const path = require("path");

class AppRunner {
  constructor() {
    this.rootDir = __dirname;
    this.processes = [];
    this.isShuttingDown = false;
  }

  run() {
    console.log("Iniciando BAEMIMPORT...\n");
    this.startService("backend", "npm", ["start"]);
    this.startService("frontend", "npm", ["start"]);
    this.attachShutdownHandlers();
  }

  startService(name, command, args) {
    const serviceDir = path.join(this.rootDir, name);
    const child = spawn(command, args, {
      cwd: serviceDir,
      shell: process.platform === "win32",
      stdio: "pipe",
    });

    this.processes.push({ name, child });

    child.stdout.on("data", (data) => {
      process.stdout.write(`[${name}] ${data}`);
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(`[${name}] ${data}`);
    });

    child.on("exit", (code) => {
      console.log(`[${name}] finalizado con código ${code}`);
      if (!this.isShuttingDown && code !== 0 && name === "frontend") {
        this.shutdown(code || 1);
      }
    });
  }

  attachShutdownHandlers() {
    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => this.shutdown(0));
    });
  }

  shutdown(exitCode) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    console.log("\nDeteniendo servicios...");
    this.processes.forEach(({ child }) => {
      if (!child.killed) child.kill();
    });
    setTimeout(() => process.exit(exitCode), 300);
  }
}

new AppRunner().run();
