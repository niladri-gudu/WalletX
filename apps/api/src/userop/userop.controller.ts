import { Body, Controller, Post } from '@nestjs/common';
import { UseropService } from './userop.service';

@Controller('userop')
export class UseropController {
  constructor(private readonly service: UseropService) {}

  @Post('send')
  async sendETH(
    @Body() body: { wallet: `0x${string}`; to: `0x${string}`; amount: string },
  ) {
    return this.service.sendETH(body.wallet, body.to, BigInt(body.amount));
  }
}
