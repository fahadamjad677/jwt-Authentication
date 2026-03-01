import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AcessjwtStrategy, RefreshjwtStrategy } from './strategy';
@Module({
  controllers: [AuthController],
  providers: [AuthService, AcessjwtStrategy, RefreshjwtStrategy],
  imports: [PrismaModule, JwtModule.register({})],
})
export class AuthModule {}
