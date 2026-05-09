import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

@Injectable()
export class LocalStorageService implements OnModuleInit {
  private root = resolve("./storage");

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.root = resolve(this.config.get<string>("STORAGE_DIR") ?? "./storage");
    await Promise.all([
      this.ensureDir("screenshots"),
      this.ensureDir("annotations"),
      this.ensureDir("reports"),
      this.ensureDir("logs"),
      this.ensureDir("traces"),
    ]);
  }

  async writeJson(folder: string, filename: string, data: unknown) {
    const path = await this.writeText(folder, filename, JSON.stringify(data, null, 2));
    return path;
  }

  async writeText(folder: string, filename: string, data: string) {
    await this.ensureDir(folder);
    const path = join(this.root, folder, filename);
    await writeFile(path, data, "utf8");
    return path;
  }

  async writeBuffer(folder: string, filename: string, data: Buffer) {
    await this.ensureDir(folder);
    const path = join(this.root, folder, filename);
    await writeFile(path, data);
    return path;
  }

  async readBuffer(path: string): Promise<Buffer> {
    return readFile(path);
  }

  async readText(path: string): Promise<string> {
    return readFile(path, "utf8");
  }

  private async ensureDir(folder: string) {
    await mkdir(join(this.root, folder), { recursive: true });
  }
}
