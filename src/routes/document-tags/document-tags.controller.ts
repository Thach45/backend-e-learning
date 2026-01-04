import { Controller, Get, Post, Put, Delete, Query, Param, Body } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { DocumentTagsService } from './document-tags.service';
import { 
  GetDocumentTagsQueryDto,
  GetDocumentTagParamsDto,
  CreateDocumentTagBodyDto,
  UpdateDocumentTagBodyDto,
  GetDocumentTagsResponseDto,
  GetDocumentTagResponseDto,
  GetTrendingTagsResponseDto,
} from './document-tags.dto';
import { Public } from 'src/shared/decorator/auth.decorator';

@Controller('api/document-tags')
export class DocumentTagsController {
  constructor(private readonly service: DocumentTagsService) {}

  @Get()
  @Public()
  @ZodSerializerDto(GetDocumentTagsResponseDto)
  async findAll(@Query() query: GetDocumentTagsQueryDto) {
    return this.service.findAll(query as any);
  }

  @Get('trending')
  @Public()
  @ZodSerializerDto(GetTrendingTagsResponseDto)
  async findTrending(@Query('limit') limit: string) {
    return this.service.findTrending(parseInt(limit) || 10);
  }

  @Get(':id')
  @Public()
  @ZodSerializerDto(GetDocumentTagResponseDto)
  async findById(@Param() params: GetDocumentTagParamsDto) {
    return this.service.findById((params as any).id);
  }

  @Post()
  @ZodSerializerDto(GetDocumentTagResponseDto)
  async create(@Body() body: CreateDocumentTagBodyDto) {
    return this.service.create(body as any);
  }

  @Put(':id')
  @ZodSerializerDto(GetDocumentTagResponseDto)
  async update(
    @Param() params: GetDocumentTagParamsDto,
    @Body() body: UpdateDocumentTagBodyDto,
  ) {
    return this.service.update((params as any).id, body as any);
  }

  @Delete(':id')
  async delete(@Param() params: GetDocumentTagParamsDto) {
    return this.service.delete((params as any).id);
  }
}

