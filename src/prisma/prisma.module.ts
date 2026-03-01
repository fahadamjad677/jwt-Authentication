import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [PrismaService],
  imports: [ConfigModule],
  exports: [PrismaService],
})
export class PrismaModule {}
