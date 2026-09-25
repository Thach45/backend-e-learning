import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { AssignmentsService } from "./assignments.service";
import {
  CourseIdParamsDto,
  CreateAssignmentBodyDto,
  GradeBodyDto,
  IdParamsDto,
  ListSubmissionsQueryDto,
  SubmitBodyDto,
  UpdateAssignmentBodyDto,
} from "./assignments.dto";

@Controller("api")
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  // ---- Giảng viên (đường dẫn có "instructor" nên mặc định chỉ ADMIN + INSTRUCTOR; quyền sở hữu khóa kiểm tra trong service)
  @Post("instructor/courses/:courseId/assignments")
  @Audit("assignment.create", "Assignment", { idParam: "courseId" })
  create(@Param() p: CourseIdParamsDto, @Body() body: CreateAssignmentBodyDto, @ActiveUser() user: any) {
    return this.service.create(p.courseId, user, body);
  }

  @Get("instructor/courses/:courseId/assignments")
  listForInstructor(@Param() p: CourseIdParamsDto, @ActiveUser() user: any) {
    return this.service.listForInstructor(p.courseId, user);
  }

  @Put("instructor/assignments/:id")
  @Audit("assignment.update", "Assignment")
  update(@Param() p: IdParamsDto, @Body() body: UpdateAssignmentBodyDto, @ActiveUser() user: any) {
    return this.service.update(p.id, user, body);
  }

  @Delete("instructor/assignments/:id")
  @Audit("assignment.delete", "Assignment")
  remove(@Param() p: IdParamsDto, @ActiveUser() user: any) {
    return this.service.remove(p.id, user);
  }

  @Get("instructor/assignments/:id/submissions")
  listSubmissions(@Param() p: IdParamsDto, @Query() q: ListSubmissionsQueryDto, @ActiveUser() user: any) {
    return this.service.listSubmissions(p.id, user, q);
  }

  @Put("instructor/submissions/:id/grade")
  @Audit("assignment.grade", "Submission")
  grade(@Param() p: IdParamsDto, @Body() body: GradeBodyDto, @ActiveUser() user: any) {
    return this.service.grade(p.id, user, body);
  }

  // ---- Học viên (phải ghi danh khóa học, kiểm tra trong service)
  @Get("courses/:courseId/assignments")
  listForStudent(@Param() p: CourseIdParamsDto, @ActiveUser() user: any) {
    return this.service.listForStudent(p.courseId, user.userId);
  }

  @Get("my-assignments")
  myAssignments(@ActiveUser() user: any) {
    return this.service.myAssignments(user.userId);
  }

  @Get("assignments/:id")
  getOne(@Param() p: IdParamsDto, @ActiveUser() user: any) {
    return this.service.getOne(p.id, user.userId);
  }

  @Put("assignments/:id/submission")
  submit(@Param() p: IdParamsDto, @Body() body: SubmitBodyDto, @ActiveUser() user: any) {
    return this.service.submit(p.id, user.userId, body);
  }
}
