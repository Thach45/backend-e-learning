import { Injectable } from "@nestjs/common";
import { CourseDetailRepository } from "./course-detail.repo";
import { CreateCourseDetailBody, UpdateCourseDetailBody } from "./course-detail.model";

@Injectable()
export class CourseDetailService {
  constructor(private readonly repo: CourseDetailRepository) {}

  async getCourseDetailByCourseId(courseId: string, checkPublished: boolean = false) {
    return this.repo.getCourseDetailByCourseId(courseId, checkPublished);
  }

  async createCourseDetail(body: CreateCourseDetailBody, instructorId: string) {
    return this.repo.createCourseDetail(body, instructorId);
  }

  async updateCourseDetail(courseId: string, body: UpdateCourseDetailBody, instructorId: string) {
    return this.repo.updateCourseDetail(courseId, body, instructorId);
  }

  async deleteCourseDetail(courseId: string, instructorId: string) {
    return this.repo.deleteCourseDetail(courseId, instructorId);
  }
 
}

