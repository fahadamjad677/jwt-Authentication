import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { PrismaClientOptions } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const URL = configService.get<string>('DATABASE_URL');
    const adapter: PrismaClientOptions['adapter'] = new PrismaPg({
      connectionString: URL,
    });
    super({ adapter });
  }

  //when app starts..
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('database connected Successfully');
    } catch (e) {
      console.log(e);
    }
  }

  //when app shut downs..
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('app shut down');
  }
}
