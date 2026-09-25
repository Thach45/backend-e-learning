import { Controller, Get } from "@nestjs/common";
import { Public } from "src/shared/decorator/auth.decorator";
import { PrismaService } from "src/shared/service/prisma.service";
import { RedisService } from "src/shared/service/redis.service";

@Controller("api/health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    const [database, redisStatus] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => "up").catch(() => "down"),
      this.redis.get("health:ping").then(() => "up").catch(() => "down"),
    ]);

    const status = database === "up" && redisStatus === "up" ? "ok" : "degraded";

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis: redisStatus,
      },
    };
  }
}
