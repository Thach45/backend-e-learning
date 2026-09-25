import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { SupportService } from "./support.service";
import { FaqService } from "./faq.service";
import {
  CreateTicketBodyDto,
  FaqCategoryBodyDto,
  FaqCategoryUpdateBodyDto,
  FaqItemBodyDto,
  FaqItemUpdateBodyDto,
  FaqQueryDto,
  FaqReorderBodyDto,
  IdParamsDto,
  ListTicketsQueryDto,
  PostMessageBodyDto,
  UpdateTicketBodyDto,
} from "./support.dto";

@Controller("api")
export class SupportController {
  constructor(
    private readonly support: SupportService,
    private readonly faq: FaqService,
  ) {}

  // ---- Ticket: người dùng
  @Post("support/tickets")
  create(@Body() body: CreateTicketBodyDto, @ActiveUser() user: any) {
    return this.support.create(user, body);
  }

  @Get("support/tickets")
  listMine(@Query() q: ListTicketsQueryDto, @ActiveUser() user: any) {
    return this.support.listMine(user, q);
  }

  @Get("support/tickets/:id")
  getOne(@Param() p: IdParamsDto, @ActiveUser() user: any) {
    return this.support.getOne(user, p.id);
  }

  @Post("support/tickets/:id/messages")
  postMessage(@Param() p: IdParamsDto, @Body() body: PostMessageBodyDto, @ActiveUser() user: any) {
    return this.support.postMessage(user, p.id, body.body);
  }

  @Post("support/tickets/:id/close")
  close(@Param() p: IdParamsDto, @ActiveUser() user: any) {
    return this.support.close(user, p.id);
  }

  // ---- Ticket: admin (đường dẫn có "admin" nên chỉ ADMIN)
  @Get("admin/support/tickets")
  listAdmin(@Query() q: ListTicketsQueryDto, @ActiveUser() user: any) {
    return this.support.listAdmin(q, user);
  }

  @Post("admin/support/tickets/:id/reply")
  @Audit("support.ticket.reply", "SupportTicket")
  reply(@Param() p: IdParamsDto, @Body() body: PostMessageBodyDto, @ActiveUser() user: any) {
    return this.support.reply(user, p.id, body.body);
  }

  @Put("admin/support/tickets/:id")
  @Audit("support.ticket.update", "SupportTicket")
  update(@Param() p: IdParamsDto, @Body() body: UpdateTicketBodyDto, @ActiveUser() user: any) {
    return this.support.update(user, p.id, body);
  }

  // ---- FAQ
  @Public()
  @Get("faqs")
  listFaqs(@Query() q: FaqQueryDto) {
    return this.faq.listPublic(q.q);
  }

  @Get("admin/faq")
  listFaqAdmin() {
    return this.faq.listAdmin();
  }

  @Post("admin/faq/categories")
  @Audit("faq.category.create", "FaqCategory")
  createCategory(@Body() body: FaqCategoryBodyDto) {
    return this.faq.createCategory(body);
  }

  @Put("admin/faq/categories/:id")
  @Audit("faq.category.update", "FaqCategory")
  updateCategory(@Param() p: IdParamsDto, @Body() body: FaqCategoryUpdateBodyDto) {
    return this.faq.updateCategory(p.id, body);
  }

  @Delete("admin/faq/categories/:id")
  @Audit("faq.category.delete", "FaqCategory")
  removeCategory(@Param() p: IdParamsDto) {
    return this.faq.removeCategory(p.id);
  }

  @Post("admin/faq/items")
  @Audit("faq.item.create", "Faq")
  createItem(@Body() body: FaqItemBodyDto) {
    return this.faq.createItem(body);
  }

  @Put("admin/faq/items/:id")
  @Audit("faq.item.update", "Faq")
  updateItem(@Param() p: IdParamsDto, @Body() body: FaqItemUpdateBodyDto) {
    return this.faq.updateItem(p.id, body);
  }

  @Delete("admin/faq/items/:id")
  @Audit("faq.item.delete", "Faq")
  removeItem(@Param() p: IdParamsDto) {
    return this.faq.removeItem(p.id);
  }

  @Put("admin/faq/reorder")
  reorder(@Body() body: FaqReorderBodyDto) {
    return this.faq.reorder(body);
  }
}
