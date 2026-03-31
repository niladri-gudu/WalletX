import { Module } from '@nestjs/common';
import { UseropService } from './userop.service.js';
import { UseropController } from './userop.controller.js';
import { SessionModule } from '../session/session.module.js';

@Module({
  imports: [SessionModule],
  providers: [UseropService],
  controllers: [UseropController],
})
export class UseropModule {}
