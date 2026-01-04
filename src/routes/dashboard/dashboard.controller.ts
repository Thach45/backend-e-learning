import { Controller, Get, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { DashboardService } from './dashboard.service';
import {
  GetOverviewStatsResponseDto,
  GetRevenueStatsResponseDto,
  GetUserStatsResponseDto,
  GetCourseStatsResponseDto,
  GetDocumentStatsResponseDto,
  GetChartDataResponseDto,
} from './dashboard.dto';

@Controller('api/admin/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview')
  @ZodSerializerDto(GetOverviewStatsResponseDto)
  async getOverviewStats() {
    console.log('getOverviewStats');
    return this.service.getOverviewStats();
  }

  @Get('revenue')
  @ZodSerializerDto(GetRevenueStatsResponseDto)
  async getRevenueStats() {
    return this.service.getRevenueStats();
  }

  @Get('users')
  @ZodSerializerDto(GetUserStatsResponseDto)
  async getUserStats() {
    return this.service.getUserStats();
  }

  @Get('courses')
  @ZodSerializerDto(GetCourseStatsResponseDto)
  async getCourseStats() {
    return this.service.getCourseStats();
  }

  @Get('documents')
  @ZodSerializerDto(GetDocumentStatsResponseDto)
  async getDocumentStats() {
    return this.service.getDocumentStats();
  }

  @Get('charts/revenue')
  @ZodSerializerDto(GetChartDataResponseDto)
  async getRevenueChartData(@Query('days') days: string) {
    return this.service.getRevenueChartData(parseInt(days) || 30);
  }

  @Get('charts/users')
  @ZodSerializerDto(GetChartDataResponseDto)
  async getUserChartData(@Query('days') days: string) {
    return this.service.getUserChartData(parseInt(days) || 30);
  }
}

