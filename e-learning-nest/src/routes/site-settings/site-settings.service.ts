import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { RedisService } from "src/shared/service/redis.service";
import { SOCIAL_KEYS, UpdateSiteSettingsBody } from "./site-settings.model";

const CACHE_KEY = "site:settings:v1";
const CACHE_TTL_SECONDS = 60;
const SINGLETON = "singleton";

type SettingsRow = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  tiktokUrl: string | null;
  zaloUrl: string | null;
  maintenanceEnabled: boolean;
  maintenanceMessage: string | null;
  maintenanceUntil: Date | null;
  updatedAt: Date | null;
};

const EMPTY: SettingsRow = {
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  youtubeUrl: null,
  linkedinUrl: null,
  tiktokUrl: null,
  zaloUrl: null,
  maintenanceEnabled: false,
  maintenanceMessage: null,
  maintenanceUntil: null,
  updatedAt: null,
};

@Injectable()
export class SiteSettingsService {
  private readonly logger = new Logger(SiteSettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Đọc cấu hình (cache Redis 60s). Không có dòng nào trong DB thì trả giá trị mặc định. */
  async getSettings(): Promise<SettingsRow> {
    const cached = await this.redis.get(CACHE_KEY).catch(() => null);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        maintenanceUntil: parsed.maintenanceUntil ? new Date(parsed.maintenanceUntil) : null,
        updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : null,
      };
    }
    const row = await this.prisma.siteSetting.findUnique({ where: { id: SINGLETON } });
    const value: SettingsRow = row ?? EMPTY;
    await this.redis.set(CACHE_KEY, JSON.stringify(value), CACHE_TTL_SECONDS).catch(() => undefined);
    return value;
  }

  async getPublic() {
    const s = await this.getSettings();
    const social = Object.fromEntries(SOCIAL_KEYS.map((k) => [k, s[k]])) as Record<(typeof SOCIAL_KEYS)[number], string | null>;
    return {
      social,
      maintenance: {
        enabled: s.maintenanceEnabled,
        message: s.maintenanceMessage,
        until: s.maintenanceUntil ? s.maintenanceUntil.toISOString() : null,
      },
    };
  }

  async update(body: UpdateSiteSettingsBody, actorId: string) {
    const data = { ...body, updatedById: actorId };
    const row = await this.prisma.siteSetting.upsert({
      where: { id: SINGLETON },
      update: data,
      create: { id: SINGLETON, ...data },
    });
    // Ghi đè cache ngay để bật/tắt bảo trì có hiệu lực tức thì (không chờ hết TTL)
    await this.redis.set(CACHE_KEY, JSON.stringify(row), CACHE_TTL_SECONDS).catch((e) => this.logger.warn(`Không ghi được cache cài đặt: ${e}`));
    return row;
  }
}
