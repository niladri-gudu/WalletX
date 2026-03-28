import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UseropModule } from './userop/userop.module.js';

@Module({
  imports: [UseropModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
