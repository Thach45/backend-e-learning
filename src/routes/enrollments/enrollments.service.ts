import { Injectable } from "@nestjs/common";
import { EnrollmentsRepository } from "./enrollments.repo";
import { CreateEnrollmentBody, GetEnrollmentsQuery } from "./enrollments.model";

@Injectable()
export class EnrollmentsService {
  constructor(private readonly repo: EnrollmentsRepository) {}

  async getEnrollments(query: GetEnrollmentsQuery, userId?: string) {
    return this.repo.getEnrollments(query, userId);
  }

  async getEnrollmentByCourseId(courseId: string, userId: string) {
    return this.repo.getEnrollmentByCourseId(courseId, userId);
  }

  async createEnrollment(body: CreateEnrollmentBody, userId: string) {
    return this.repo.createEnrollment(body, userId);
  }

  async completeEnrollment(courseId: string, userId: string) {
    return this.repo.completeEnrollment(courseId, userId);
  }

  async getEnrollmentsByCourse(courseId: string, instructorId: string, query: GetEnrollmentsQuery) {
    return this.repo.getEnrollmentsByCourse(courseId, instructorId, query);
  }

  async getInstructorStudents(instructorId: string, query: GetEnrollmentsQuery) {
    return this.repo.getInstructorStudents(instructorId, query);
  }
}

