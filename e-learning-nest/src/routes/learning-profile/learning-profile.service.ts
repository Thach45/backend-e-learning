import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import {
  GetRecommendationsQuery,
  MAX_ONBOARDING_SKIPS,
  UpdateLearningProfileBody,
} from "./learning-profile.model";
import { MIN_SCORE, scoreCourse, type Level } from "./recommendation.util";

const tagSelect = { id: true, name: true, slug: true, type: true, categoryId: true } as const;

@Injectable()
export class LearningProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const [profile, interests] = await Promise.all([
      this.prisma.userLearningProfile.findUnique({ where: { userId } }),
      this.prisma.userInterest.findMany({
        where: { userId, tag: { isActive: true } },
        select: { tag: { select: tagSelect } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const completedAt = profile?.onboardingCompletedAt ?? null;
    const skippedCount = profile?.onboardingSkippedCount ?? 0;

    return {
      goal: profile?.goal ?? null,
      goalNote: profile?.goalNote ?? null,
      currentLevel: profile?.currentLevel ?? null,
      occupation: profile?.occupation ?? null,
      industry: profile?.industry ?? null,
      yearsOfExperience: profile?.yearsOfExperience ?? null,
      weeklyHours: profile?.weeklyHours ?? null,
      preferredLanguage: profile?.preferredLanguage ?? "vi",
      allowPersonalization: profile?.allowPersonalization ?? false,
      interests: interests.map((i) => i.tag),
      onboarding: {
        completedAt,
        skippedCount,
        shouldPrompt: !completedAt && skippedCount < MAX_ONBOARDING_SKIPS,
      },
    };
  }

  async updateProfile(userId: string, body: UpdateLearningProfileBody) {
    const { interestTagIds, completed, ...fields } = body;

    const existing = await this.prisma.userLearningProfile.findUnique({
      where: { userId },
      select: { onboardingCompletedAt: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.userLearningProfile.upsert({
        where: { userId },
        create: { userId, ...fields, ...(completed ? { onboardingCompletedAt: new Date() } : {}) },
        update: {
          ...fields,
          ...(completed && !existing?.onboardingCompletedAt ? { onboardingCompletedAt: new Date() } : {}),
        },
      });

      if (interestTagIds) {
        const unique = [...new Set(interestTagIds)];
        const valid = unique.length
          ? await tx.tag.findMany({ where: { id: { in: unique }, isActive: true }, select: { id: true } })
          : [];
        await tx.userInterest.deleteMany({ where: { userId } });
        if (valid.length) {
          // Nguồn dữ liệu: chọn ở màn hướng dẫn hay tự sửa sau này (để sau còn phân biệt khi tính trọng số)
          const source = existing?.onboardingCompletedAt ? "MANUAL" : "ONBOARDING";
          await tx.userInterest.createMany({ data: valid.map((t) => ({ userId, tagId: t.id, source })) });
        }
      }
    });

    return this.getProfile(userId);
  }

  /** Bỏ qua màn hướng dẫn: cộng dồn số lần, đủ số lần thì thôi nhắc. */
  async skipOnboarding(userId: string) {
    const current = await this.prisma.userLearningProfile.findUnique({ where: { userId }, select: { onboardingSkippedCount: true } });
    const next = Math.min((current?.onboardingSkippedCount ?? 0) + 1, MAX_ONBOARDING_SKIPS);
    await this.prisma.userLearningProfile.upsert({
      where: { userId },
      create: { userId, onboardingSkippedCount: next },
      update: { onboardingSkippedCount: next },
    });
    return this.getProfile(userId);
  }

  /** Gợi ý khoá học theo luật. Chỉ chạy khi người dùng đã đồng ý cá nhân hoá. */
  async recommend(userId: string, query: GetRecommendationsQuery) {
    const profile = await this.prisma.userLearningProfile.findUnique({ where: { userId } });
    if (!profile?.allowPersonalization) return { enabled: false, data: [] };

    const interests = await this.prisma.userInterest.findMany({
      where: { userId, tag: { isActive: true } },
      select: { tagId: true, tag: { select: { name: true, categoryId: true } } },
    });
    const tagNames = new Map(interests.map((i) => [i.tagId, i.tag.name]));
    const user = {
      tagIds: new Set(interests.map((i) => i.tagId)),
      categoryIds: new Set(interests.map((i) => i.tag.categoryId).filter((c): c is string => !!c)),
      level: (profile.currentLevel as Level | null) ?? null,
      language: profile.preferredLanguage,
    };

    const courses = await this.prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        isActive: true,
        enrollments: { none: { userId } },
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        price: true,
        salePrice: true,
        level: true,
        language: true,
        categoryId: true,
        instructor: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { tagId: true } },
      },
      take: 500,
      orderBy: { createdAt: "desc" },
    });

    return {
      enabled: true,
      data: courses
        .map((c) => {
          const m = scoreCourse(user, {
            tagIds: c.tags.map((t) => t.tagId),
            categoryId: c.categoryId,
            level: c.level as Level,
            language: c.language,
          });
          const reasons: string[] = [];
          if (m.matchedTagIds.length) {
            reasons.push(`Chủ đề bạn quan tâm: ${m.matchedTagIds.slice(0, 2).map((id) => tagNames.get(id)).join(", ")}`);
          }
          if (m.sameCategory) reasons.push("Cùng lĩnh vực bạn quan tâm");
          if (m.levelMatch === "exact") reasons.push("Đúng trình độ của bạn");
          return { course: c, score: m.score, reasons };
        })
        .filter((r) => r.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score)
        .slice(0, query.limit)
        .map(({ course, reasons }) => ({
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          price: course.price,
          salePrice: course.salePrice,
          level: course.level,
          language: course.language,
          instructor: course.instructor,
          category: course.category,
          reasons,
        })),
    };
  }
}
