import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");

if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
