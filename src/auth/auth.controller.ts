import { Body, Controller, Delete, Post, Req, UnauthorizedException } from '@nestjs/common';
import UserData from 'src/entities/UserData.entity';
import { DataSource } from 'typeorm';
import loginDto from './login.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

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

    /* @Delete('logout')
    async logout(@Req() req: Request) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        await this.authService.deleteTokenFor(token);
      }
    } */
  }
