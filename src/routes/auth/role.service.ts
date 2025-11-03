import { Injectable } from '@nestjs/common';
import { ROLES } from '@prisma/client';

import { PrismaService } from 'src/shared/service/prisma.service';

@Injectable()
export class RoleService {
    constructor(private readonly prisma: PrismaService) {}
    private clientRole: string | null = null;
    async getClientRole() {
        if(this.clientRole) return this.clientRole;
        try {
            console.log("Getting client role");
            const clientRole = await this.prisma.role.findFirstOrThrow({
                where: {
                    name: ROLES.CLIENT
                }
            });
            this.clientRole = clientRole.id;
    
            return this.clientRole;
            
        } catch (error) {
            throw new Error("Client role not found");
        }
        
    }
}
