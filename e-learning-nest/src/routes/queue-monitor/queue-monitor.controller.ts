import { Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { Audit } from "src/shared/decorator/audit.decorator";
import { QueueMonitorService } from "./queue-monitor.service";

class NameParamsDto extends createZodDto(z.object({ name: z.string().min(1).max(50) }).strict()) {}
class JobParamsDto extends createZodDto(z.object({ name: z.string().min(1).max(50), id: z.string().min(1).max(200) }).strict()) {}
class JobsQueryDto extends createZodDto(
  z.object({ state: z.enum(["waiting", "active", "delayed", "failed", "completed"]).default("failed"), limit: z.coerce.number().int().min(1).max(100).default(30) }),
) {}

/** Giám sát hàng đợi và tình trạng hệ thống. Đường dẫn có "admin" nên mặc định chỉ ADMIN. */
@Controller("api/admin")
export class QueueMonitorController {
  constructor(private readonly service: QueueMonitorService) {}

  @Get("queues")
  overview() {
    return this.service.overview();
  }

  @Get("queues/:name/jobs")
  jobs(@Param() p: NameParamsDto, @Query() q: JobsQueryDto) {
    return this.service.jobs(p.name, q.state, q.limit);
  }

  @Post("queues/:name/retry-failed")
  @Audit("queue.retry-all", "Queue", { idParam: "name" })
  retryAll(@Param() p: NameParamsDto) {
    return this.service.retryAllFailed(p.name);
  }

  @Post("queues/:name/jobs/:id/retry")
  @Audit("queue.job.retry", "Queue", { idParam: "name" })
  retry(@Param() p: JobParamsDto) {
    return this.service.retry(p.name, p.id);
  }

  @Delete("queues/:name/jobs/:id")
  @Audit("queue.job.remove", "Queue", { idParam: "name" })
  remove(@Param() p: JobParamsDto) {
    return this.service.remove(p.name, p.id);
  }

  @Get("system/status")
  system() {
    return this.service.system();
  }
}
