import { Audit } from 'src/shared/decorator/audit.decorator';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { CommentsService } from "./comments.service";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import {
  CreateCommentBodyDto,
  UpdateCommentBodyDto,
  GetCommentsQueryDto,
  GetCommentsParamsDto,
  GetCommentByIdParamsDto,
  GetCommentResponseDto,
  GetCommentsResponseDto,
  ToggleReactionBodyDto,
  ToggleReactionResponseDto,
} from "./comments.dto";

@Controller("api")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // Client endpoints
  @Post("lessons/:lessonId/comments")
  @ZodSerializerDto(GetCommentResponseDto)
  async createComment(
    @Param() params: GetCommentsParamsDto,
    @Body() body: CreateCommentBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.commentsService.createComment(
      { ...body, lessonId: (params as any).lessonId },
      user.userId,
    );
  }

  @Get("lessons/:lessonId/comments")
  @ZodSerializerDto(GetCommentsResponseDto)
  async getCommentsByLesson(
    @Param() params: GetCommentsParamsDto,
    @Query() query: GetCommentsQueryDto,
    @ActiveUser() user: any,
  ) {
    return this.commentsService.getCommentsByLesson(
      (params as any).lessonId,
      query as any,
      user?.userId,
    );
  }

  @Get("lessons/:lessonId/comments/:commentId")
  @ZodSerializerDto(GetCommentResponseDto)
  async getCommentById(@Param() params: GetCommentByIdParamsDto, @ActiveUser() user: any) {
    return this.commentsService.getCommentById(
      (params as any).commentId,
      (params as any).lessonId,
      user?.userId,
    );
  }

  @Post("comments/:commentId/reactions")
  @ZodSerializerDto(ToggleReactionResponseDto)
  async toggleReaction(
    @Param("commentId") commentId: string,
    @Body() body: ToggleReactionBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.commentsService.toggleReaction(commentId, user.userId, body.type);
  }

  @Put("lessons/:lessonId/comments/:commentId")
  @ZodSerializerDto(GetCommentResponseDto)
  async updateComment(
    @Param() params: GetCommentByIdParamsDto,
    @Body() body: UpdateCommentBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.commentsService.updateComment(
      (params as any).commentId,
      (params as any).lessonId,
      body as any,
      user.userId,
    );
  }

  @Delete("lessons/:lessonId/comments/:commentId")
  async deleteComment(
    @Param() params: GetCommentByIdParamsDto,
    @ActiveUser() user: any,
  ) {
    return this.commentsService.deleteComment(
      (params as any).commentId,
      (params as any).lessonId,
      user.userId,
    );
  }

  // Admin endpoints
  @Get("admin/comments")
  @ZodSerializerDto(GetCommentsResponseDto)
  async getCommentsAdmin(@Query() query: GetCommentsQueryDto) {
    return this.commentsService.getComments(query as any);
  }

  @Audit('comment.admin_update', 'Comment', { idParam: 'commentId' })
  @Put("admin/lessons/:lessonId/comments/:commentId")
  @ZodSerializerDto(GetCommentResponseDto)
  async updateCommentAdmin(
    @Param() params: GetCommentByIdParamsDto,
    @Body() body: UpdateCommentBodyDto,
  ) {
    return this.commentsService.updateComment(
      (params as any).commentId,
      (params as any).lessonId,
      body as any,
    );
  }

  @Audit('comment.admin_delete', 'Comment', { idParam: 'commentId' })
  @Delete("admin/lessons/:lessonId/comments/:commentId")
  async deleteCommentAdmin(@Param() params: GetCommentByIdParamsDto) {
    return this.commentsService.deleteComment(
      (params as any).commentId,
      (params as any).lessonId,
    );
  }
}
