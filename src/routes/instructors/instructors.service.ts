import { Injectable } from "@nestjs/common";
import { InstructorsRepository } from "./instructors.repo";

@Injectable()
export class InstructorsService {
  constructor(private readonly instructorsRepo: InstructorsRepository) {}

  async getPublicProfile(instructorId: string) {
    return this.instructorsRepo.getPublicProfile(instructorId);
  }
}
