import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashingService {
    hashPassword(password: string) {
        return bcrypt.hash(password, saltRounds);
    }
    comparePassword(password: string, hash: string) {
        return bcrypt.compare(password, hash);
    }
}
