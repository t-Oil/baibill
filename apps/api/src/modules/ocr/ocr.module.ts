import { Module } from '@nestjs/common';
import { GcpVisionService } from './gcp-vision.service';

@Module({
  providers: [GcpVisionService],
  exports: [GcpVisionService],
})
export class OcrModule {}
