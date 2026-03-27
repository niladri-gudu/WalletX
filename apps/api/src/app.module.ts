import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UseropModule } from './userop/userop.module';

@Module({
  imports: [UseropModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
