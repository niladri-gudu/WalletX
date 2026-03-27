import { Module } from '@nestjs/common';
import { UseropService } from './userop.service';
import { UseropController } from './userop.controller';

@Module({
  providers: [UseropService],
  controllers: [UseropController]
})
export class UseropModule {}
