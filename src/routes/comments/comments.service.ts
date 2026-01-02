import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "./comments.repo";
import { CreateCommentBody, GetCommentsQuery, UpdateCommentBody } from "./comments.model";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepo: CommentsRepository) {}

  async getComments(query: GetCommentsQuery) {
    return this.commentsRepo.getComments(query);
  }

  async getCommentById(commentId: string, lessonId: string) {
    return this.commentsRepo.getCommentById(commentId, lessonId);
  }

  async createComment(body: CreateCommentBody, userId: string) {
    return this.commentsRepo.createComment(body, userId);
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
