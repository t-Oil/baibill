import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
