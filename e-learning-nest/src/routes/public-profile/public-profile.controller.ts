import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { PublicProfileService } from "./public-profile.service";

const optText = (max: number) => z.string().trim().max(max).nullish().transform((v) => (v ? v : null));
class IdDto extends createZodDto(z.object({ userId: z.string().uuid() }).strict()) {}
class UpdateDto extends createZodDto(
  z.object({ isPublic: z.boolean(), headline: optText(100), bio: optText(500), showCourses: z.boolean(), showBadges: z.boolean() }).partial().strict(),
) {}

@Controller("api")
export class PublicProfileController {
  constructor(private readonly service: PublicProfileService) {}

  @Get("profile/public")
  mine(@ActiveUser() user: any) {
    return this.service.mine(user.userId);
  }

  @Audit("profile.public.update", "PublicProfile")
  @Put("profile/public")
  update(@Body() b: UpdateDto, @ActiveUser() user: any) {
    return this.service.update(user.userId, b as any);
  }

  @Public()
  @Get("profiles/:userId")
  view(@Param() p: IdDto) {
    return this.service.view(p.userId);
  }
}
