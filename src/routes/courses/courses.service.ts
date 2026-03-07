import { Injectable } from "@nestjs/common";
import { CoursesRepository } from "./courses.repo";
import { CreateCourseBody, GetCoursesQuery, UpdateCourseBody } from "./courses.model";


@Injectable()
export class CoursesService {
  constructor(private readonly repo: CoursesRepository) {}

  async getCourses(query: GetCoursesQuery) {
    return this.repo.getCourses(query);
  }

  async getCourseById(id: string) {
    return this.repo.getCourseById(id);
  }

  async createCourse(body: CreateCourseBody, actor: { userId: string }) {
    return this.repo.createCourse(body, actor);
  }

  async updateCourse(id: string, body: UpdateCourseBody, actor?: { userId: string }) {
    return this.repo.updateCourse(id, body, actor);
  }

  async deleteCourse(id: string) {
    return this.repo.deleteCourse(id);
  }

  async requestApproval(id: string, instructorId: string) {
    return this.repo.requestApproval(id, instructorId);
  }

  async requestDelete(id: string, instructorId: string) {
    return this.repo.requestDelete(id, instructorId);
  }

  // Admin methods
  async approvePublish(id: string, adminId: string) {
    return this.repo.approvePublish(id, adminId);
  }

  async rejectPublish(id: string, adminId: string) {
    return this.repo.rejectPublish(id, adminId);
  }

  async approveDelete(id: string, adminId: string) {
    return this.repo.approveDelete(id, adminId);
  }

  async rejectDelete(id: string, adminId: string) {
    return this.repo.rejectDelete(id, adminId);
  }

  async getCourseByIdAdmin(id: string) {
    return this.repo.getCourseByIdAdmin(id);
  }
}


