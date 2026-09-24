import { Injectable, Logger } from "@nestjs/common";
import { CommentsRepository } from "./comments.repo";
import { CreateCommentBody, GetCommentsQuery, UpdateCommentBody } from "./comments.model";
import { NotificationsService } from "src/routes/notifications/notifications.service";

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getComments(query: GetCommentsQuery) {
    return this.commentsRepo.getComments(query);
  }

  async getCommentById(commentId: string, lessonId: string) {
    return this.commentsRepo.getCommentById(commentId, lessonId);
  }

  async createComment(body: CreateCommentBody, userId: string) {
    const created = await this.commentsRepo.createComment(body, userId);
    await this.notifyOnNewComment(created, userId);
    return created;
  }

  /** Báo cho người liên quan khi có bình luận/trả lời mới. Không được làm hỏng luồng tạo comment. */
  private async notifyOnNewComment(comment: any, authorId: string) {
    try {
      const authorName = comment.user?.name ?? "Một học viên";
      const lessonTitle = comment.lesson?.title ?? "bài học";

      if (comment.parentId && comment.parent?.userId && comment.parent.userId !== authorId) {
        await this.notificationsService.create({
          userId: comment.parent.userId,
          type: "NEW_REPLY",
          title: "Có trả lời mới cho bình luận của bạn",
          message: `${authorName} đã trả lời bình luận của bạn trong bài học "${lessonTitle}"`,
          lessonId: comment.lessonId,
          commentId: comment.id,
        });
        return;
      }

      const instructorId = comment.lesson?.content?.course?.instructorId;
      if (instructorId && instructorId !== authorId) {
        await this.notificationsService.create({
          userId: instructorId,
          type: "NEW_COMMENT",
          title: "Có bình luận mới trong khóa học",
          message: `${authorName} đã bình luận trong bài học "${lessonTitle}"`,
          lessonId: comment.lessonId,
          commentId: comment.id,
        });
      }
    } catch (error) {
      this.logger.warn(`Không thể tạo notification cho comment ${comment.id}: ${error}`);
    }
  }

  async updateComment(commentId: string, lessonId: string, body: UpdateCommentBody, userId?: string) {
    return this.commentsRepo.updateComment(commentId, lessonId, body, userId);
  }

  async deleteComment(commentId: string, lessonId: string, userId?: string) {
    return this.commentsRepo.deleteComment(commentId, lessonId, userId);
  }

  async getCommentsByLesson(lessonId: string, query: GetCommentsQuery) {
    return this.commentsRepo.getCommentsByLesson(lessonId, query);
  }
}
