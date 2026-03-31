import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SessionService } from './session.service.js';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('create')
  async createSession(
    @Body()
    body: {
      allowedTarget: `0x${string}`;
      maxAmount: string;
      durationSeconds: number;
    },
  ) {
    return this.sessionService.createSession(
      body.allowedTarget,
      BigInt(body.maxAmount),
      body.durationSeconds,
    );
  }

  @Delete('revoke/:address')
  async revokeSession(@Param('address') address: `0x${string}`) {
    return this.sessionService.revokeSession(address);
  }

  @Get('list')
  getAllSessions() {
    return this.sessionService.getAllSessions();
  }
}
