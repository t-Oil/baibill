import {
  Injectable,
  Logger as NestLogger,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TErrorDetails = {
  [key: string]: any;
};
@Injectable()
export class Logger implements LoggerService {
  private readonly nestLogger: NestLogger;

  constructor(private readonly configService: ConfigService) {
    this.nestLogger = new NestLogger(Logger.name);
  }

  log(message: string) {
    this.nestLogger.log(message);
  }

  error(message: string, errors: TErrorDetails) {
    this.nestLogger.error(message, errors);
  }

  warn(message: string) {
    this.nestLogger.warn(message);
  }

  debug(message: string) {
    this.nestLogger.debug(message);
  }

  verbose(message: string) {
    this.nestLogger.verbose(message);
  }
}
