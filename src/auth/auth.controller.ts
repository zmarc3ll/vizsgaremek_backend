import { Body, Controller, Delete, Post, UnauthorizedException, UseGuards, Request, Req, Headers } from '@nestjs/common';
import UserData from 'src/entities/UserData.entity';
import { DataSource } from 'typeorm';
import loginDto from './login.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IncomingHttpHeaders } from 'http';
import { AuthGuard } from '@nestjs/passport';
import Token from './token.entity';

@Controller('auth')
export class AuthController {
  constructor(private dataSource: DataSource, private authService: AuthService) { }

  @Post('login')
  async login(@Body() loginData: loginDto) {
    const userRepo = this.dataSource.getRepository(UserData);
    const user = await userRepo.findOneBy({ username: loginData.username });
    if (user === null) {
      throw new UnauthorizedException(' Hibás felhasználónév vagy jelszó!');
    }
    if (!await bcrypt.compare(loginData.password, user.password)) {
      throw new UnauthorizedException('Hibás felhasználónév vagy jelszó!');
    }

    return {
      token: await this.authService.generateTokenFor(user),
    };
  }

  @Delete('logout')
  @UseGuards(AuthGuard('bearer'))
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization.split(' ')[1];
    await this.authService.deleteTokenFor(token);
  }
}
