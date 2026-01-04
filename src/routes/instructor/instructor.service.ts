import { Injectable } from '@nestjs/common';
import { InstructorRepo } from './instructor.repo';
import type {
  InstructorStats,
  CourseAnalytics,
  RevenueChartData,
  GetEnrolledStudentsQuery,
  GetEnrolledStudentsResponse,
} from './instructor.model';

@Injectable()
export class InstructorService {
  constructor(private readonly repo: InstructorRepo) {}

  async getInstructorStats(instructorId: string): Promise<InstructorStats> {
    return this.repo.getInstructorStats(instructorId);
  }

  async getCourseAnalytics(instructorId: string): Promise<{ data: CourseAnalytics[] }> {
    const analytics = await this.repo.getCourseAnalytics(instructorId);
    return { data: analytics };
  }

  async getRevenueChartData(
    instructorId: string,
    query: { days?: number; startDate?: string; endDate?: string },
  ): Promise<RevenueChartData> {
    return this.repo.getRevenueChartData(instructorId, query);
  }

  async getEnrolledStudents(
    instructorId: string,
    query: GetEnrolledStudentsQuery,
  ): Promise<GetEnrolledStudentsResponse> {
    return this.repo.getEnrolledStudents(instructorId, query);
  }
}

