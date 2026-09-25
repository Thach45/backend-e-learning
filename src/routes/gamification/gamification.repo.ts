import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { BadgeCodeValue, BadgeDefinition, LeaderboardEntry, MyBadge, StreakResponse } from "./gamification.model";

@Injectable()
export class GamificationRepository {
  private readonly logger = new Logger(GamificationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedBadges() {
    for (const code of Object.keys(BadgeDefinition) as BadgeCodeValue[]) {
      const def = BadgeDefinition[code];
      await this.prisma.badge.upsert({
        where: { code: code as any },
        update: { name: def.name, description: def.description, icon: def.icon },
        create: { code: code as any, name: def.name, description: def.description, icon: def.icon },
      });
    }
  }

  async getMyBadges(userId: string): Promise<MyBadge[]> {
    const [allBadges, earned] = await Promise.all([
      this.prisma.badge.findMany({ orderBy: { createdAt: "asc" } }),
      this.prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true, awardedAt: true } }),
    ]);
    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.awardedAt]));

    return allBadges.map((b) => ({
      code: b.code as BadgeCodeValue,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earned: earnedMap.has(b.id),
      awardedAt: earnedMap.get(b.id) ?? null,
    }));
  }

  async getStreak(userId: string): Promise<StreakResponse> {
    const rows = await this.prisma.learningProgress.findMany({
      where: { userId },
      orderBy: { lastAccessed: "desc" },
      take: 500,
      select: { lastAccessed: true },
    });

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const activeDays = new Set(rows.map((r) => dayKey(r.lastAccessed)));

    if (activeDays.size === 0) {
      return { currentStreak: 0, lastActiveDate: null };
    }

    const lastActiveDate = Array.from(activeDays).sort().reverse()[0];

    const today = new Date();
    const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // Nếu hôm nay chưa học, streak vẫn còn nếu hôm qua có học (chưa qua nửa đêm 2 lần liên tiếp)
    if (!activeDays.has(dayKey(cursor))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      if (!activeDays.has(dayKey(cursor))) {
        return { currentStreak: 0, lastActiveDate };
      }
    }

    let streak = 0;
    while (activeDays.has(dayKey(cursor))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return { currentStreak: streak, lastActiveDate };
  }

  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const grouped = await this.prisma.learningProgress.groupBy({
      by: ["userId"],
      where: { progressPercent: 100 },
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: limit,
    });
    if (grouped.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: grouped.map((g) => g.userId) } },
      select: { id: true, name: true, avatar: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return grouped.map((g, idx) => ({
      rank: idx + 1,
      userId: g.userId,
      name: userMap.get(g.userId)?.name ?? "Người dùng",
      avatar: userMap.get(g.userId)?.avatar ?? null,
      completedLessons: g._count.userId,
    }));
  }

  private async awardBadge(userId: string, code: BadgeCodeValue) {
    const badge = await this.prisma.badge.findUnique({ where: { code: code as any } });
    if (!badge) {
      this.logger.warn(`Badge ${code} chưa được seed, bỏ qua trao thưởng`);
      return;
    }
    await this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id },
    });
  }

  async checkCourseCompletionBadges(userId: string) {
    const completedCount = await this.prisma.enrollment.count({
      where: { userId, completedAt: { not: null } },
    });
    if (completedCount >= 1) await this.awardBadge(userId, "FIRST_COURSE_COMPLETED");
    if (completedCount >= 5) await this.awardBadge(userId, "FIVE_COURSES_COMPLETED");
  }

  async checkReviewBadge(userId: string) {
    const count = await this.prisma.review.count({ where: { userId } });
    if (count >= 1) await this.awardBadge(userId, "FIRST_REVIEW");
  }

  async checkStreakBadges(userId: string) {
    const { currentStreak } = await this.getStreak(userId);
    if (currentStreak >= 7) await this.awardBadge(userId, "STREAK_7_DAYS");
    if (currentStreak >= 30) await this.awardBadge(userId, "STREAK_30_DAYS");
  }
}
