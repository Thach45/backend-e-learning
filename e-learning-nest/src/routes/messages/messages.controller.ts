import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { MessagesService } from "./messages.service";

const uuid = z.string().uuid();
const text = z.string().trim().min(1).max(2000);
class IdDto extends createZodDto(z.object({ id: uuid }).strict()) {}
class ContactsQueryDto extends createZodDto(z.object({ search: z.string().trim().max(60).optional() })) {}
class StartDto extends createZodDto(z.object({ toUserId: uuid, body: text }).strict()) {}
class SendDto extends createZodDto(z.object({ body: text }).strict()) {}
class BlockDto extends createZodDto(z.object({ blocked: z.boolean() }).strict()) {}
class MessagesQueryDto extends createZodDto(z.object({ before: z.coerce.date().optional(), limit: z.coerce.number().int().min(1).max(100).default(30) })) {}

/** Không có đường dẫn admin nên admin cũng chỉ thấy cuộc trò chuyện của chính mình (mọi truy vấn đều ràng buộc theo người tham gia). */
@Controller("api")
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get("conversations")
  list(@ActiveUser() user: any) {
    return this.service.list(user.userId);
  }

  @Get("conversations/unread-count")
  unread(@ActiveUser() user: any) {
    return this.service.unreadCount(user.userId);
  }

  @Get("conversations/contacts")
  contacts(@Query() q: ContactsQueryDto, @ActiveUser() user: any) {
    return this.service.contacts(user.userId, q.search);
  }

  @Post("conversations")
  start(@Body() b: StartDto, @ActiveUser() user: any) {
    return this.service.start(user.userId, b.toUserId, b.body);
  }

  @Get("conversations/:id/messages")
  messages(@Param() p: IdDto, @Query() q: MessagesQueryDto, @ActiveUser() user: any) {
    return this.service.messages(p.id, user.userId, q.before, q.limit);
  }

  @Post("conversations/:id/messages")
  send(@Param() p: IdDto, @Body() b: SendDto, @ActiveUser() user: any) {
    return this.service.send(p.id, user.userId, b.body);
  }

  @Put("conversations/:id/read")
  read(@Param() p: IdDto, @ActiveUser() user: any) {
    return this.service.markRead(p.id, user.userId);
  }

  @Put("conversations/:id/block")
  block(@Param() p: IdDto, @Body() b: BlockDto, @ActiveUser() user: any) {
    return this.service.setBlocked(p.id, user.userId, b.blocked);
  }
}
