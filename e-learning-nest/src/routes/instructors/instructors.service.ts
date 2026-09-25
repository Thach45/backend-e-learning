import { Injectable } from "@nestjs/common";
import { InstructorsRepository } from "./instructors.repo";

@Injectable()
export class InstructorsService {
  constructor(private readonly instructorsRepo: InstructorsRepository) {}

  async getPublicProfile(instructorId: string, viewerUserId?: string) {
    return this.instructorsRepo.getPublicProfile(instructorId, viewerUserId);
  }

  async follow(instructorId: string, followerId: string) {
    return this.instructorsRepo.follow(instructorId, followerId);
  }

  async unfollow(instructorId: string, followerId: string) {
    return this.instructorsRepo.unfollow(instructorId, followerId);
  }

  async getFollowStatus(instructorId: string, followerId: string) {
    return this.instructorsRepo.getFollowStatus(instructorId, followerId);
  }
}
