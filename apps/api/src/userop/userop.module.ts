import { Module } from '@nestjs/common';
import { UseropService } from './userop.service.js';
import { UseropController } from './userop.controller.js';

@Module({
  providers: [UseropService],
  controllers: [UseropController],
})
export class UseropModule {}
