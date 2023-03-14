import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AppService } from 'src/app.service';
import UserData from 'src/UserData.entity';
import { DataSource } from 'typeorm';
import loginDto from './login.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
constructor(private dataSource: DataSource, private authService: AuthService) {}

    @Post('login')
    async login(@Body() loginData: loginDto) {
            const userRepo = this.dataSource.getRepository(UserData);
            const user = await userRepo.findOneBy({ username: loginData.username });
            if(user === null) {
                throw new UnauthorizedException(' Hibás felhasználónév vagy jelszó!');
            }
            if (!await bcrypt.compare(loginData.password, user.password)) {
                throw new UnauthorizedException('Hibás felhasználónév vagy jelszó!');                
            }

        return {
            token: await this.authService.generateTokenFor(user),
        };
    }
}
