import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: any): Promise<string> {
   
    return req.user?.userId || req.ip
  }
}