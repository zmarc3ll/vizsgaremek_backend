import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Render } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import UserData from './UserData.dto';
import * as bcrypt from 'bcrypt';
import ChangeUserData from './ChangeUserData.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) { }

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

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

  @Get()
  ownProfile() {
    return {
      data: 'this is the current users profile',
    };
  }

  
}
