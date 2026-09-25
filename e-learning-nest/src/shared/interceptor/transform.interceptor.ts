import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface Response chuẩn, bao gồm cả statusCode và message
 */
export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>> // <-- Sử dụng Interface mới
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    
    // Lấy statusCode từ context
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map(data => ({
        // 'data' là dữ liệu thô (raw) từ Controller
        
        statusCode: statusCode, // <-- Khớp với Interface
        message: 'Success',     // <-- Thêm message cho đầy đủ
        data: data,             // <-- Khớp với Interface
      })),
    );
  }
}