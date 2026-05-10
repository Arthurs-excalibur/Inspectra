import { Injectable, ForbiddenException } from "@nestjs/common";
import { URL } from "node:url";

@Injectable()
export class SecurityService {
  private readonly BLOCKED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "169.254.169.254", // Cloud metadata
    "::1",
  ];

  private readonly PRIVATE_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
  ];

  validateUrl(url: string): string {
    try {
      const parsed = new URL(url);

      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new ForbiddenException(`Protocol ${parsed.protocol} is not allowed.`);
      }

      if (this.BLOCKED_HOSTS.includes(parsed.hostname)) {
        throw new ForbiddenException(`Access to ${parsed.hostname} is restricted.`);
      }

      for (const range of this.PRIVATE_IP_RANGES) {
        if (range.test(parsed.hostname)) {
          throw new ForbiddenException("Access to internal network addresses is restricted.");
        }
      }

      return parsed.toString();
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new ForbiddenException("Invalid or dangerous URL detected.");
    }
  }
}
