import { Controller, Get, Query } from '@nestjs/common';
import { getBalance } from './sol_functions';

@Controller('api')
export class ApiController {
  @Get()
  docs() {
    return {
      "GET /balance?addr=[ADDRESS]": "Returns account balance",
    }
  }

  @Get('balance') async getBalance(@Query('addr') addr: string) {
    return {
      ok: true,
      balance: await getBalance(addr),
    }
  }



}
