import { Injectable } from "@nestjs/common";
import { PrismaService } from "../service/prisma.service";
import { UserType } from "../types/shared-user.type";

@Injectable()
export class SharedUserRepo {
    constructor(private readonly prisma: PrismaService) {}

    async findUserByEmail(email: string): Promise<UserType | null> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });
        return user;
    }
    
}