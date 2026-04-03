import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UseropService } from './userop.service.js';

@Controller('userop')
export class UseropController {
  constructor(private readonly service: UseropService) {}

  @Post('send')
  async sendETH(
    @Body() body: { wallet: `0x${string}`; to: `0x${string}`; amount: string },
  ) {
    return this.service.sendETH(body.wallet, body.to, BigInt(body.amount));
  }

  @Post('send-session')
  async sendWithSession(
    @Body()
    body: {
      wallet: `0x${string}`;
      to: `0x${string}`;
      amount: string;
      sessionKeyAddress: `0x${string}`;
    },
  ) {
    return this.service.sendWithSessionKey(
      body.wallet,
      body.to,
      BigInt(body.amount),
      body.sessionKeyAddress,
    );
  }

  @Get('status/:txHash')
  async getStatus(@Param('txHash') txHash: `0x${string}`) {
    return this.service.getUserOpStatus(txHash);
  }
}
