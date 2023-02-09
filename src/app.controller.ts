import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Render } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import UserData from './UserData';

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
  addUser(@Body() user: UserData) {
    user.id = undefined;
    const users = this.dataSource.getRepository(UserData);
    users.save(user);
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

  /* @Patch('/user/:id')
  @HttpCode(200)
  async ChangeUserData(
    @Param('id') id: number,
    @Body() UserData: UserData) {
    const userRepo = this.dataSource.getRepository(UserData);
    const user = await userRepo.findOneBy({ id: id });
    user.username = ChangeUserData.username;
    user.password = ChangeUserData.password;
  } */

  
}
