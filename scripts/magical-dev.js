#!/usr/bin/env node

import { spawn, exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { existsSync } from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

const magic = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",

  rainbow: (text) => {
    const colors = [
      magic.red,
      magic.yellow,
      magic.green,
      magic.cyan,
      magic.blue,
      magic.magenta,
    ];
    return (
      text
        .split("")
        .map((char, i) => colors[i % colors.length] + char)
        .join("") + magic.reset
    );
  },

  box: (text, color = magic.cyan) => {
    const lines = text.split("\n");
    const maxLength = Math.max(...lines.map((line) => line.length));
    const border = "─".repeat(maxLength + 2);

    return [
      color + "┌" + border + "┐" + magic.reset,
      ...lines.map(
        (line) => color + "│ " + line.padEnd(maxLength) + " │" + magic.reset
      ),
      color + "└" + border + "┘" + magic.reset,
    ].join("\n");
  },
};

class MagicalSpinner {
  constructor(
    message = "Loading...",
    frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  ) {
    this.message = message;
    this.frames = frames;
    this.current = 0;
    this.interval = null;
  }

  start() {
    process.stdout.write("\x1B[?25l");
    this.interval = setInterval(() => {
      process.stdout.write(
        `\r${magic.cyan}${this.frames[this.current]}${magic.reset} ${
          this.message
        }`
      );
      this.current = (this.current + 1) % this.frames.length;
    }, 100);
  }

  stop(successMessage = "") {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write("\r\x1B[K");
    process.stdout.write("\x1B[?25h");
    if (successMessage) {
      console.log(`${magic.green}✓${magic.reset} ${successMessage}`);
    }
  }

  update(message) {
    this.message = message;
  }
}

class DependencyMagic {
  static async checkAndInstall() {
    const spinner = new MagicalSpinner("Checking dependencies...");
    spinner.start();

    try {
      const nodeModulesPath = path.join(process.cwd(), "node_modules");
      const packageJsonPath = path.join(process.cwd(), "package.json");

      if (!existsSync(nodeModulesPath)) {
        spinner.update("Installing dependencies for the first time...");
        await execAsync("npm install");
        spinner.stop("Dependencies installed successfully!");
        return;
      }

      const [nodeModulesStat, packageJsonStat] = await Promise.all([
        fs.stat(nodeModulesPath),
        fs.stat(packageJsonPath),
      ]);

      if (packageJsonStat.mtime > nodeModulesStat.mtime) {
        spinner.update("Package.json changed, updating dependencies...");
        await execAsync("npm install");
        spinner.stop("Dependencies updated!");
      } else {
        spinner.stop("Dependencies are up to date!");
      }
    } catch (error) {
      spinner.stop();
      console.log(
        `${magic.yellow}⚠${magic.reset} Dependency check failed, continuing anyway...`
      );
    }
  }
}

class CacheMagic {
  static async optimize() {
    const spinner = new MagicalSpinner("Optimizing caches...");
    spinner.start();

    try {
      const viteCachePath = path.join(process.cwd(), "node_modules", ".vite");
      if (existsSync(viteCachePath)) {
        const stat = await fs.stat(viteCachePath);
        const daysSinceModified =
          (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceModified > 7) {
          spinner.update("Clearing old Vite cache...");
          await fs.rm(viteCachePath, { recursive: true, force: true });
        }
      }

      spinner.stop("Cache optimized!");
    } catch (error) {
      spinner.stop("Cache optimization skipped");
    }
  }
}

class PortMagic {
  static async findMagicalPort(startPort = 5173) {
    const net = await import("net");

    function checkPort(port) {
      return new Promise((resolve) => {
        const server = net.default.createServer();
        server.once("error", () => resolve(false));
        server.once("listening", () => {
          server.close();
          resolve(true);
        });
        server.listen(port);
      });
    }

    if (await checkPort(startPort)) {
      return startPort;
    }

    for (let port = startPort + 1; port < startPort + 10; port++) {
      if (await checkPort(port)) {
        return port;
      }
    }

    return startPort;
  }
}

class BrowserMagic {
  static async launchWithDevTools(url) {
    const isWindows = process.platform === "win32";
    const isMac = process.platform === "darwin";

    try {
      if (isWindows) {
        const commands = [
          `start chrome "${url}" --auto-open-devtools-for-tabs`,
          `start msedge "${url}" --auto-open-devtools-for-tabs`,
          `start "${url}"`,
        ];

        for (const cmd of commands) {
          try {
            await execAsync(cmd);
            break;
          } catch (e) {
            continue;
          }
        }
      } else if (isMac) {
        await execAsync(
          `open -a "Google Chrome" "${url}" --args --auto-open-devtools-for-tabs`
        );
      } else {
        await execAsync(
          `google-chrome "${url}" --auto-open-devtools-for-tabs || firefox "${url}"`
        );
      }
    } catch (error) {
      console.log(
        `${magic.yellow}⚠${magic.reset} Could not auto-open browser with dev tools`
      );
    }
  }
}

async function startMagicalDevelopment() {
  console.clear();
  console.log(
    magic.box(
      magic.rainbow("✨ TIA SCHEDULE BUILDER - MAGICAL DEV ✨"),
      magic.cyan
    )
  );
  console.log("");

  try {
    console.log(`${magic.blue}🔮 Phase 1: Environment Magic${magic.reset}`);
    await DependencyMagic.checkAndInstall();
    await CacheMagic.optimize();

    console.log(`\n${magic.blue}🔮 Phase 2: Port Magic${magic.reset}`);
    const port = await PortMagic.findMagicalPort();
    console.log(
      `${magic.green}✓${magic.reset} Found magical port: ${magic.cyan}${port}${magic.reset}`
    );

    console.log(
      `\n${magic.blue}🔮 Phase 3: Svelte Server Summoning${magic.reset}`
    );
    const startTime = Date.now();

    const args = ["dev", "--port", port.toString(), "--logLevel=error"];
    if (process.argv.includes("--open") || process.argv.includes("--browser")) {
      args.push("--open");
    }

    const vite = spawn("vite", args, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    let serverReady = false;

    vite.stdout.on("data", async (data) => {
      const output = data.toString();

      if (
        (output.includes("ready") || output.includes("Local:")) &&
        !serverReady
      ) {
        serverReady = true;
        const startupTime = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(
          "\n" +
            magic.box(
              `
🚀 TIA Schedule Builder Ready in ${startupTime}s!

${magic.bright}Local:${magic.reset}   ${magic.cyan}http://localhost:${port}/${magic.reset}
${magic.bright}Network:${magic.reset} ${magic.dim}Use --host to expose${magic.reset}

${magic.green}✨ Schedule magic is active! Press Ctrl+C to stop${magic.reset}
${magic.yellow}💡 Press F5 in browser for enhanced reload${magic.reset}
        `.trim(),
              magic.green
            )
        );

        if (
          process.argv.includes("--open") ||
          process.argv.includes("--browser")
        ) {
          console.log(
            `\n${magic.yellow}🌐 Opening browser with dev tools...${magic.reset}`
          );
          await BrowserMagic.launchWithDevTools(`http://localhost:${port}`);
        }

        process.on("SIGINT", () => {
          console.log(
            `\n\n${magic.magenta}✨ Thanks for building magical schedules!${magic.reset}`
          );
          vite.kill("SIGINT");
          process.exit(0);
        });
      }

      if (output.includes("ERROR") || output.includes("error")) {
        console.log(`\n${magic.red}💥 ${output.trim()}${magic.reset}`);
      }
    });

    vite.stderr.on("data", (data) => {
      const error = data.toString();
      if (!error.includes("ExperimentalWarning")) {
        console.log(`${magic.red}🚨 ${error.trim()}${magic.reset}`);
      }
    });

    vite.on("close", (code) => {
      if (code !== 0) {
        console.log(
          `\n${magic.red}💔 Server stopped with code ${code}${magic.reset}`
        );
      }
    });

    setTimeout(() => {
      if (!serverReady) {
        console.log(
          `\n${magic.dim}💡 Tip: Add --browser to auto-open with dev tools${magic.reset}`
        );
        console.log(
          `${magic.dim}💡 Tip: Press F5 in browser for magical reload${magic.reset}`
        );
        console.log(
          `${magic.dim}🎨 Building beautiful schedule interfaces...${magic.reset}`
        );
      }
    }, 2000);
  } catch (error) {
    console.error(
      `\n${magic.red}💥 Magical startup failed:${magic.reset}`,
      error.message
    );
    process.exit(1);
  }
}

startMagicalDevelopment().catch((error) => {
  console.error(
    `${magic.red}💥 Critical magical failure:${magic.reset}`,
    error
  );
  process.exit(1);
});
