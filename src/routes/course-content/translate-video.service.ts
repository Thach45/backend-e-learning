import { Injectable } from '@nestjs/common';
import * as celery from 'celery-node';
import { RedisService } from 'src/shared/service/redis.service';

@Injectable()
export class VideoService {
  // Kết nối thẳng vào con Redis đang chạy local
  constructor(private readonly redisService: RedisService) {
    // Broker và backend cùng dùng DB 0 (Redis Cloud chỉ hỗ trợ DB 0)
    const redisUrl = process.env.REDIS_URL ?? '';
    const redisUrlDb0 = redisUrl.replace(/\/\d+$/, '') + '/0';
    this.celeryClient = celery.createClient(redisUrlDb0, redisUrlDb0);
  }

  private celeryClient: any;

  async triggerDubbingJob(videoId: string, videoUrl: string) {
    console.log(`Đang ném task lồng tiếng video ${videoId} sang cho thằng đệ Python...`);
    
    // Tên task này PHẢI KHỚP 100% với tên hàm bên Python nha ông
    const task = this.celeryClient.createTask('worker.process_dubbing_video');
    
    // Ném 2 cái biến id và url qua đó
    task.delay(videoId, videoUrl);
    
    return { message: 'Đã đẩy vào hàng đợi thành công, cứ đi dạo đi, xong nó báo!' };
  }
}