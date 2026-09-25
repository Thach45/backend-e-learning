import { Injectable } from "@nestjs/common";
import { CourseContentRepository } from "./course-content.repo";
import { CreateCourseContentBody, UpdateCourseContentBody, ReorderCourseContentsBody } from "./course-content.model";

@Injectable()
export class CourseContentService {
  constructor(private readonly repo: CourseContentRepository) {}

  async getCourseContents(courseId: string, instructorId: string) {
    return this.repo.getCourseContents(courseId, instructorId);
  }

  async getCourseContentById(id: string, courseId: string, instructorId: string) {
    return this.repo.getCourseContentById(id, courseId, instructorId);
  }

  async createCourseContent(body: CreateCourseContentBody, instructorId: string) {
    return this.repo.createCourseContent(body, instructorId);
  }

  async updateCourseContent(id: string, courseId: string, body: UpdateCourseContentBody, instructorId: string) {
    return this.repo.updateCourseContent(id, courseId, body, instructorId);
  }

  async deleteCourseContent(id: string, courseId: string, instructorId: string) {
    return this.repo.deleteCourseContent(id, courseId, instructorId);
  }

  async reorderCourseContents(courseId: string, body: ReorderCourseContentsBody, instructorId: string) {
    return this.repo.reorderCourseContents(courseId, body, instructorId);
  }
}

