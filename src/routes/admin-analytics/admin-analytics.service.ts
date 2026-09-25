import { Injectable } from "@nestjs/common";
import { AdminAnalyticsRepo, CourseAnalyticsRow, InstructorAnalyticsRow } from "./admin-analytics.repo";
import { CourseAnalyticsQuery, InstructorAnalyticsQuery } from "./admin-analytics.model";

const COURSE_SORT: Record<string, keyof CourseAnalyticsRow> = {
  enrollments: "enrollments",
  rating: "avgRating",
  completionRate: "completionRate",
  satisfaction: "avgSatisfaction",
  quizPassRate: "quizPassRate",
  unansweredQuestions: "unansweredQuestions",
};

const INSTRUCTOR_SORT: Record<string, keyof InstructorAnalyticsRow> = {
  students: "students",
  courses: "courses",
  rating: "avgRating",
  followers: "followers",
};

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly repo: AdminAnalyticsRepo) {}

  getOverview() {
    return this.repo.getOverview();
  }

  async getCourseAnalytics(query: CourseAnalyticsQuery) {
    const rows = await this.repo.getCourseRows(query.search);
    return this.repo.sortAndPage(rows, query, (k) => COURSE_SORT[k]);
  }

  async getInstructorAnalytics(query: InstructorAnalyticsQuery) {
    const rows = await this.repo.getInstructorRows(query.search);
    return this.repo.sortAndPage(rows, query, (k) => INSTRUCTOR_SORT[k]);
  }
}
