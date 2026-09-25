import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GamificationRepository } from "./gamification.repo";

@Injectable()
export class GamificationService implements OnModuleInit {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly repo: GamificationRepository) {}

  async onModuleInit() {
    try {
      await this.repo.seedBadges();
    } catch (error) {
      this.logger.warn(`Không thể seed badge mặc định (DB chưa sẵn sàng?): ${error}`);
    }
  }

  async getMyBadges(userId: string) {
    return { data: await this.repo.getMyBadges(userId) };
  }

  async getStreak(userId: string) {
    return this.repo.getStreak(userId);
  }

  async getLeaderboard() {
    return { data: await this.repo.getLeaderboard() };
  }

  /** Gọi sau khi enrollment.completedAt được set. Không được làm hỏng luồng gọi. */
  async checkCourseCompletionBadges(userId: string) {
    try {
      await this.repo.checkCourseCompletionBadges(userId);
    } catch (error) {
      this.logger.warn(`checkCourseCompletionBadges lỗi cho user ${userId}: ${error}`);
    }
  }

  /** Gọi sau khi tạo review. Không được làm hỏng luồng gọi. */
  async checkReviewBadge(userId: string) {
    try {
      await this.repo.checkReviewBadge(userId);
    } catch (error) {
      this.logger.warn(`checkReviewBadge lỗi cho user ${userId}: ${error}`);
    }
  }

  /** Gọi sau khi cập nhật tiến độ học. Không được làm hỏng luồng gọi. */
  async checkStreakBadges(userId: string) {
    try {
      await this.repo.checkStreakBadges(userId);
    } catch (error) {
      this.logger.warn(`checkStreakBadges lỗi cho user ${userId}: ${error}`);
    }
  }
}
