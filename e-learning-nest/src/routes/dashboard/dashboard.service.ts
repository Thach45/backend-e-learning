import { Injectable } from '@nestjs/common';
import { DashboardRepo } from './dashboard.repo';
import type {
  OverviewStats,
  RevenueStats,
  UserStats,
  CourseStats,
  DocumentStats,
  ChartData,
} from './dashboard.model';

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepo) {}

  async getOverviewStats(): Promise<OverviewStats> {
    return this.repo.getOverviewStats();
  }

  async getRevenueStats(): Promise<RevenueStats> {
    return this.repo.getRevenueStats();
  }

  async getUserStats(): Promise<UserStats> {
    return this.repo.getUserStats();
  }

  async getCourseStats(): Promise<CourseStats> {
    return this.repo.getCourseStats();
  }

  async getDocumentStats(): Promise<DocumentStats> {
    return this.repo.getDocumentStats();
  }

  async getRevenueChartData(days = 30): Promise<ChartData> {
    return this.repo.getRevenueChartData(days);
  }

  async getUserChartData(days = 30): Promise<ChartData> {
    return this.repo.getUserChartData(days);
  }
}

