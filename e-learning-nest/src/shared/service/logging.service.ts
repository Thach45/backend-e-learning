import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logStream: fs.WriteStream;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFilePath = path.join(logDir, 'app.log');
    this.logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    // Dùng console trực tiếp, KHÔNG dùng Logger của Nest
    console.log('[AppLogger] initialized, writing to logs/app.log');
  }

  private writeToFile(level: string, message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    const logMessage = `[${timestamp}] [${level}]${ctx} ${message}\n`;
    this.logStream.write(logMessage);
  }

  log(message: any, context?: string) {
    const ctx = context ? `[${context}]` : '';
    console.log(`[LOG]${ctx}`, message);
    this.writeToFile('LOG', String(message), context);
  }

  error(message: any, trace?: string, context?: string) {
    const ctx = context ? `[${context}]` : '';
    const full = trace ? `${message} | ${trace}` : String(message);
    console.error(`[ERROR]${ctx}`, full);
    this.writeToFile('ERROR', full, context);
  }

  warn(message: any, context?: string) {
    const ctx = context ? `[${context}]` : '';
    console.warn(`[WARN]${ctx}`, message);
    this.writeToFile('WARN', String(message), context);
  }

  debug(message: any, context?: string) {
    const ctx = context ? `[${context}]` : '';
    console.debug(`[DEBUG]${ctx}`, message);
    this.writeToFile('DEBUG', String(message), context);
  }

  verbose(message: any, context?: string) {
    const ctx = context ? `[${context}]` : '';
    console.debug(`[VERBOSE]${ctx}`, message);
    this.writeToFile('VERBOSE', String(message), context);
  }
}