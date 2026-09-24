import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCommentBody, GetCommentsQuery, ReactionTypeValue, UpdateCommentBody } from "./comments.model";
import { Prisma, ReactionType } from "@prisma/client";

const reactionSelect = { select: { type: true, userId: true } } as const;

const commentSelect = {
  id: true,
  userId: true,
  lessonId: true,
  content: true,
  parentId: true,
  createdAt: true,
  reactions: reactionSelect,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
  lesson: {
    select: {
      id: true,
      title: true,
      content: {
        select: {
          courseId: true,
          course: { select: { instructorId: true, title: true } },
        },
      },
    },
  },
  parent: {
    select: {
      id: true,
      userId: true,
      lessonId: true,
      content: true,
      parentId: true,
      createdAt: true,
      reactions: reactionSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  },
  replies: {
    select: {
      id: true,
      userId: true,
      lessonId: true,
      content: true,
      parentId: true,
      createdAt: true,
      reactions: reactionSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

type RawReaction = { type: ReactionType; userId: string };

type CommentUser = { id: string; name: string; email: string; avatar: string | null };

type LeafComment = {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  reactions?: RawReaction[];
  user?: CommentUser;
};

type FullComment = LeafComment & {
  lesson?: {
    id: string;
    title: string;
    content?: {
      courseId: string;
      course?: { instructorId: string; title: string } | null;
    } | null;
  };
  parent?: LeafComment | null;
  replies?: LeafComment[];
};

function summarizeReactions(reactions: RawReaction[], viewerUserId?: string) {
  const reactionCounts = { LIKE: 0, LOVE: 0, HELPFUL: 0 };
  let myReaction: ReactionTypeValue | null = null;
  for (const r of reactions) {
    reactionCounts[r.type] += 1;
    if (viewerUserId && r.userId === viewerUserId) {
      myReaction = r.type;
    }
  }
  return { reactionCounts, myReaction };
}

function summarizeLeaf(comment: LeafComment, viewerUserId?: string) {
  const { reactions, ...rest } = comment;
  return { ...rest, ...summarizeReactions(reactions ?? [], viewerUserId) };
}

// Gắn reactionCounts/myReaction vào comment (và parent/replies lồng bên trong), bỏ mảng reactions thô.
function withReactionSummary(comment: FullComment, viewerUserId?: string) {
  const { reactions, parent, replies, ...rest } = comment;
  return {
    ...rest,
    ...summarizeReactions(reactions ?? [], viewerUserId),
    parent: parent ? summarizeLeaf(parent, viewerUserId) : parent,
    replies: replies ? replies.map((r) => summarizeLeaf(r, viewerUserId)) : replies,
  };
}

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getComments(query: GetCommentsQuery, viewerUserId?: string) {
    const { page, limit, lessonId, userId, parentId } = query;
    if (page < 1 || limit < 1) {
      throw new BadRequestException("Page and limit must be positive numbers");
    }

    // Ensure parentId is explicitly null for top-level comments, not undefined
    const where: Prisma.CommentWhereInput = {
      ...(lessonId ? { lessonId } : {}),
      ...(userId ? { userId } : {}),
      // Explicitly filter: if parentId is null, get only top-level; if undefined, get all
      ...(parentId !== undefined ? { parentId } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: commentSelect,
      }),
      this.prisma.comment.count({ where }),
    ]);

    const data = rows.map((row) => withReactionSummary(row, viewerUserId));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCommentById(commentId: string, lessonId: string, viewerUserId?: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, lessonId },
      select: commentSelect,
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    return withReactionSummary(comment, viewerUserId);
  }

  async createComment(body: CreateCommentBody, userId: string) {
    // Validate lesson exists and get courseId
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: body.lessonId },
      select: { 
        id: true,
        content: {
          select: {
            courseId: true,
          },
        },
      },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${body.lessonId} not found`);
    }

    const courseId = lesson.content?.courseId;
    if (!courseId) {
      throw new BadRequestException("Lesson does not belong to any course");
    }

    // Check if user has enrolled in the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new BadRequestException("You must enroll in the course before commenting on lessons");
    }

    // If it's a reply, validate parent comment exists and belongs to same lesson
    if (body.parentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: { id: body.parentId, lessonId: body.lessonId },
        select: { id: true, lessonId: true },
      });
      if (!parentComment) {
        throw new BadRequestException("Parent comment not found or does not belong to this lesson");
      }
    }

    // Create comment
    const created = await this.prisma.comment.create({
      data: {
        userId,
        lessonId: body.lessonId,
        content: body.content,
        parentId: body.parentId || null,
      },
      select: commentSelect,
    });
    return withReactionSummary(created, userId);
  }

  async updateComment(commentId: string, lessonId: string, body: UpdateCommentBody, userId?: string) {
    // Validate comment exists
    const existing = await this.prisma.comment.findFirst({
      where: { id: commentId, lessonId },
      select: { id: true, userId: true },
    });
    if (!existing) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // If userId provided, check ownership
    if (userId && existing.userId !== userId) {
      throw new ForbiddenException("You can only update your own comments");
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: body.content,
      },
      select: commentSelect,
    });
    return withReactionSummary(updated, userId);
  }

  async deleteComment(commentId: string, lessonId: string, userId?: string) {
    // Validate comment exists
    const existing = await this.prisma.comment.findFirst({
      where: { id: commentId, lessonId },
      select: { id: true, userId: true },
    });
    if (!existing) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // If userId provided, check ownership
    if (userId && existing.userId !== userId) {
      throw new ForbiddenException("You can only delete your own comments");
    }

    // Delete comment (replies will be handled by cascade if needed, or set parentId to null)
    await this.prisma.comment.delete({
      where: { id: commentId },
    });
    return { success: true };
  }

  async getCommentsByLesson(lessonId: string, query: GetCommentsQuery, viewerUserId?: string) {
    // Validate lesson exists
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return this.getComments({ ...query, lessonId }, viewerUserId);
  }

  async toggleReaction(commentId: string, userId: string, type: ReactionTypeValue) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    const existing = await this.prisma.commentReaction.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing && existing.type === type) {
      // Bấm lại cùng loại reaction -> bỏ reaction
      await this.prisma.commentReaction.delete({ where: { id: existing.id } });
    } else if (existing) {
      await this.prisma.commentReaction.update({
        where: { id: existing.id },
        data: { type },
      });
    } else {
      await this.prisma.commentReaction.create({
        data: { commentId, userId, type },
      });
    }

    const reactions = await this.prisma.commentReaction.findMany({
      where: { commentId },
      select: { type: true, userId: true },
    });
    return summarizeReactions(reactions, userId);
  }
}
