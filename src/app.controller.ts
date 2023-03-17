import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post,Request, UseGuards} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import UserData from './UserData.entity';
import * as bcrypt from 'bcrypt';
import ChangeUserData from './ChangeUserData.entity';
import { AuthGuard } from '@nestjs/passport';
import Token from './auth/token.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) { }

  @Post('user')
  @HttpCode(200)
  async addUser(@Body() userData: UserData) {
    const userRepo = this.dataSource.getRepository(UserData);
    userData.id = undefined;
    const user = new UserData();
    user.username=userData.username;
    user.password = await bcrypt.hash(userData.password, 5)
    user.passwordAuth = await userData.passwordAuth;
    user.email = userData.email;
    user.birthDate=userData.birthDate;
    user.registrationDate=userData.registrationDate;
    delete user.passwordAuth;
    await userRepo.save(user);
    delete user.password;
    return user;
  }

  @Get('user')
  async listUsers() {
    const users = this.dataSource.getRepository(UserData);
    return await users.find();
  }

  @Delete('user/:id')
  deleteUser(@Param('id') id: number) {
    const users = this.dataSource.getRepository(UserData);
    users.delete(id);
  }

  @Patch('/user/:id')
  @HttpCode(200)
  async ChangeUserData(
    @Param('id') id: number,
    @Body() changeUserData: ChangeUserData) {
    const userRepo = this.dataSource.getRepository(UserData);
    const user = await userRepo.findOneBy({ id: id });
    user.username = changeUserData.username;
    user.password = changeUserData.password;
    user.passwordAuth = changeUserData.passwordAuth;
     await userRepo.save(user);
     delete user.password;
     delete user.passwordAuth;
    return user;
  } 

  @Get('profile')
  @UseGuards(AuthGuard('bearer'))
  ownProfile(@Request() req) {
    const user: UserData = req.user;
    return {
      email: user.email,
      birthDate: user.birthDate,
    };
  }

  @Delete('auth/logout')
  @UseGuards(AuthGuard('bearer'))
  deleteToken(@Request() req) {
    const user: UserData = req.user;
    const tokenRepo = this.dataSource.getRepository(Token);
    tokenRepo.delete({ user: user });
  }

}
