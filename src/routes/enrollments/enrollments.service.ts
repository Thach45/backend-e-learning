import { Injectable } from "@nestjs/common";
import { EnrollmentsRepository } from "./enrollments.repo";
import { CreateEnrollmentBody, CreateEnrollmentByInstructorBody, GetEnrollmentsQuery } from "./enrollments.model";

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

  async removeStudent(enrollmentId: string, instructorId: string) {
    return this.repo.removeStudent(enrollmentId, instructorId);
  }

  async getEnrollmentStats(userId: string) {
    return this.repo.getEnrollmentStats(userId);
  }

  async getCourseContentsForEnrolledUser(courseId: string, userId: string) {
    return this.repo.getCourseContentsForEnrolledUser(courseId, userId);
  }

  async getLessonDetailForEnrolledUser(courseId: string, lessonId: string, userId: string) {
    return this.repo.getLessonDetailForEnrolledUser(courseId, lessonId, userId);
  }

  async createEnrollmentByInstructor(courseId: string, body: CreateEnrollmentByInstructorBody, instructorId: string) {
    return this.repo.createEnrollmentByInstructor(courseId, body.userId, instructorId);
  }
}

