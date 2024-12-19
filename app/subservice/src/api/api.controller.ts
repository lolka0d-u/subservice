import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { getBalance } from './sol_functions';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  docs() {
    return {
      "GET /balance?addr=[ADDRESS]": {
        msg: "Returns account balance",
        params: {}
      },
      "POST /createCreator": {
        msg: "Creates creator plan with given params.",
        params: [
          {
            name: "creator",
            type: "String(PublicKey)",
            explanation: "Owner of the plan"
          },
          {
            name: "payto",
            type: "String(PublicKey)",
            explanation: "Account where customer's money was transferred to"
          },
          {
            name: "name",
            type: "String",
            explanation: "Name of the plan",
          },
          {
            name: "subscription_plans",
            type: "list[lists[price: int, name: string, image_url: string]]",
            explanation: "Subscription plans. Every plan is a list with price in lamports, name and image url",
          }
        ]
      },
    }
  }

  @Get('balance')
  async getBalance(@Query('addr') addr: string) {
    return {
      ok: true,
      balance: await getBalance(addr),
    }
  }
  @Post('createCreator')
  // add check if it contains all fields
  async createCreator(@Body() createCreatorDto: CreateCreatorDto) {
    return this.apiService.createCreator(createCreatorDto);
  }

}
