import { execSync } from "child_process";
import net from "net";
import path from "path";
import fs from "fs";

const PORT = process.env.NEXT_PUBLIC_PORT || 3001;
const APP_DIR = path.join(process.cwd(), "apps", "web");

if (!fs.existsSync(APP_DIR)) {
  console.error("[ERROR] apps/web not found. Check your monorepo structure.");
  process.exit(1);
}

const server = net.createServer();

server.once("error", () => {
  console.error(`[ERROR] Port ${PORT} is already in use. Aborting dev startup.`);
  process.exit(1);
});

server.once("listening", () => {
  server.close();
  console.log(`[OK] Starting PareL web app on port ${PORT}...`);
  process.env.PORT = PORT;
  process.env.NEXTAUTH_URL = `http://localhost:${PORT}`;
  process.chdir(APP_DIR);
  execSync("pnpm next dev", { stdio: "inherit", env: process.env });
});

server.listen(PORT);