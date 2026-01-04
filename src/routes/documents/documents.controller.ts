import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { DocumentsService } from './documents.service';
import { Public } from 'src/shared/decorator/auth.decorator';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import {
  GetDocumentsQueryDto,
  GetDocumentParamsDto,
  CreateDocumentBodyDto,
  UpdateDocumentBodyDto,
  ToggleVerifyBodyDto,
  GetDocumentsResponseDto,
  GetDocumentResponseDto,
  GetTopContributorsResponseDto,
  LikeResponseDto,
  DownloadResponseDto,
} from './documents.dto';
import { Request } from 'express';

@Controller('api')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  // ============= PUBLIC ENDPOINTS =============

  @Get('documents')
  @Public()
  @ZodSerializerDto(GetDocumentsResponseDto)
  async getDocuments(@Query() query: GetDocumentsQueryDto, @ActiveUser() user: any) {
    return this.service.getDocuments(query as any, user?.userId);
  }

  @Get('documents/trending')
  @Public()
  @ZodSerializerDto(GetDocumentsResponseDto)
  async getTrendingDocuments(@Query('limit') limit: string, @ActiveUser() user: any) {
    return this.service.getTrendingDocuments(parseInt(limit) || 10, user?.userId);
  }

  @Get('documents/top-contributors')
  @Public()
  @ZodSerializerDto(GetTopContributorsResponseDto)
  async getTopContributors(@Query('limit') limit: string) {
    return this.service.getTopContributors(parseInt(limit) || 10);
  }

  @Get('documents/:id')
  @Public()
  @ZodSerializerDto(GetDocumentResponseDto)
  async getDocumentById(@Param() params: GetDocumentParamsDto, @ActiveUser() user: any) {
    return this.service.getDocumentById((params as any).id, user?.userId, true);
  }

  // ============= AUTHENTICATED ENDPOINTS =============

  @Post('documents')
  @ZodSerializerDto(GetDocumentResponseDto)
  async createDocument(@Body() body: CreateDocumentBodyDto, @ActiveUser() user: any) {
    return this.service.createDocument(body as any, user.userId);
  }

  @Put('documents/:id')
  @ZodSerializerDto(GetDocumentResponseDto)
  async updateDocument(
    @Param() params: GetDocumentParamsDto,
    @Body() body: UpdateDocumentBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.service.updateDocument((params as any).id, body as any, user.userId);
  }

  @Delete('documents/:id')
  async deleteDocument(@Param() params: GetDocumentParamsDto, @ActiveUser() user: any) {
    return this.service.deleteDocument((params as any).id, user.userId);
  }

  @Post('documents/:id/like')
  @ZodSerializerDto(LikeResponseDto)
  async toggleLike(@Param() params: GetDocumentParamsDto, @ActiveUser() user: any) {
    return this.service.toggleLike((params as any).id, user.userId);
  }

  @Delete('documents/:id/like')
  @ZodSerializerDto(LikeResponseDto)
  async unlikeDocument(@Param() params: GetDocumentParamsDto, @ActiveUser() user: any) {
    // Same as toggle - will unlike if already liked
    return this.service.toggleLike((params as any).id, user.userId);
  }

  @Post('documents/:id/download')
  @ZodSerializerDto(DownloadResponseDto)
  async trackDownload(
    @Param() params: GetDocumentParamsDto,
    @ActiveUser() user: any,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    return this.service.trackDownload((params as any).id, user?.userId, ipAddress);
  }

  @Get('my-documents')
  @ZodSerializerDto(GetDocumentsResponseDto)
  async getMyDocuments(@Query() query: GetDocumentsQueryDto, @ActiveUser() user: any) {
    return this.service.getMyDocuments(user.userId, query as any);
  }

  @Get('my-liked-documents')
  @ZodSerializerDto(GetDocumentsResponseDto)
  async getMyLikedDocuments(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @ActiveUser() user: any,
  ) {
    return this.service.getMyLikedDocuments(user.userId, parseInt(page) || 1, parseInt(limit) || 20);
  }

  // ============= ADMIN ENDPOINTS =============

  @Get('admin/documents')
  @ZodSerializerDto(GetDocumentsResponseDto)
  async getAdminDocuments(@Query() query: GetDocumentsQueryDto) {
    return this.service.getAdminDocuments(query as any);
  }

  @Put('admin/documents/:id/verify')
  @ZodSerializerDto(GetDocumentResponseDto)
  async toggleVerified(
    @Param() params: GetDocumentParamsDto,
    @Body() body: ToggleVerifyBodyDto,
  ) {
    return this.service.toggleVerified((params as any).id, (body as any).isVerified);
  }

  @Delete('admin/documents/:id')
  async adminDeleteDocument(@Param() params: GetDocumentParamsDto) {
    return this.service.adminDeleteDocument((params as any).id);
  }

  
}
