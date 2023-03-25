import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import UserData from './entities/UserData.entity';
import * as bcrypt from 'bcrypt';
import ChangeUserData from './entities/ChangeUserData.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CarData from './entities/CarData.entity';
import { Response } from 'express';

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
    user.username = userData.username;
    user.password = await bcrypt.hash(userData.password, 5)
    user.passwordAuth = await userData.passwordAuth;
    user.email = userData.email;
    user.birthDate = userData.birthDate;
    user.registrationDate = userData.registrationDate;
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

  @Post('uploadfile')
  @UseInterceptors(FileInterceptor('carFile', {
    storage: diskStorage({
      destination: './uploadedFiles/cars',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    })
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: UserData,) {
    const carData = new CarData();
    carData.carPic = file.filename;
    const userId = req.id;
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    carData.userId = user;

    const carDataRepository = this.dataSource.getRepository(CarData);
    await carDataRepository.save(carData);
    return carData;
    
  }

  @Get('uploadedfiles/cars/:carPic')
  async getCarPicture(@Param('carPic') carPic: string, @Res() res: Response) {
    const carDataRepository = this.dataSource.getRepository(CarData);
    const carData = await carDataRepository.findOne({ where: { carPic } });
    if (!carData || !carData.carPic) {
      res.status(404).send('Car picture not found');
      return;
    }
    return res.sendFile(carData.carPic, { root: './uploadedFiles/cars' });
  }
}
