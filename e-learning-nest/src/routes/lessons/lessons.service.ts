import { Injectable } from "@nestjs/common";
import { LessonsRepository } from "./lessons.repo";
import { CreateLessonBody, UpdateLessonBody } from "./lessons.model";

@Injectable()
export class LessonsService {
  constructor(private readonly repo: LessonsRepository) {}

  async getLessons(courseId: string, contentId: string, instructorId: string) {
    return this.repo.getLessons(courseId, contentId, instructorId);
  }

  async getLessonById(id: string, courseId: string, contentId: string, instructorId: string) {
    return this.repo.getLessonById(id, courseId, contentId, instructorId);
  }

  async createLesson(body: CreateLessonBody, instructorId: string) {
    return this.repo.createLesson(body, instructorId);
  }

  async updateLesson(
    id: string,
    courseId: string,
    contentId: string,
    body: UpdateLessonBody,
    instructorId: string,
  ) {
    return this.repo.updateLesson(id, courseId, contentId, body, instructorId);
  }

  async deleteLesson(id: string, courseId: string, contentId: string, instructorId: string) {
    return this.repo.deleteLesson(id, courseId, contentId, instructorId);
  }
}

