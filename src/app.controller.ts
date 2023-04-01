import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import UserData from './entities/UserData.entity';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import CarData from './entities/CarData.entity';
import { Response } from 'express';
import CarPicture from './entities/CarPicture.entity';

interface AuthenticatedRequest extends Request {
  user: UserData;
  car: CarData;
  carPic: CarPicture;
}

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

  @Get('usersCar/:id')
  async getUsersCarById(@Param('id') userId: number) {
    const carRepo = this.dataSource.getRepository(CarData);
    const usersCar = await carRepo.findOne({ where: { userId: { id: userId } } });
    return usersCar;
  }

  @Get('car')
  async listCars() {
    const cars = this.dataSource.getRepository(CarData);
    return await cars.find();
  }

 /*  @Get('carPic')
  async getCarPic( @Request() req: CarData) {
    const carPicRepo = this.dataSource.getRepository(CarPicture);
     const carRepo = this.dataSource.getRepository(CarData);
     const car = req.carId
     const carId = await carPicRepo.findOne({
      where: { carsId: car },
    }); //maybe not correct
    return await carId;
  }
 */
  @Get('carPic')
async getCarPic(@Request() req: CarData) {
  const carPicRepo = this.dataSource.getRepository(CarPicture);
  const carId = req.carId; // Assuming this is the car ID you want to find pictures for

  // Find the car pictures for the given car ID
  const carPictures = await carPicRepo.find({
    where: {
      carsId: {
        carId: carId
      }
    }
  });

  return carPictures; 
}

  @Post('car')
  @HttpCode(200)
  async addCar(@Body() carData: CarData, @Request() req: UserData) {
    const carRepo = this.dataSource.getRepository(CarData);
    carData.carId = undefined;
    const car = new CarData();
    car.brand = carData.brand;
    car.model = carData.model;
    car.modelYear = carData.modelYear;
    car.fuelType = carData.fuelType;
    car.carPower = carData.carPower;
    car.gearType = carData.gearType;
    car.color = carData.color;
    car.chassisType = carData.chassisType;
    car.doors = carData.doors;
    car.fuelEconomy = carData.fuelEconomy;
    car.license_plate = carData.license_plate;
    car.givenName = carData.givenName;
    const userId = req.id;
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    car.userId = user;
    carData.userId = user;
    car.userId = carData.userId;
    await carRepo.save(car);
    return car
  }

  @Delete('user/:id')
  deleteUser(@Param('id') id: number) {
    const users = this.dataSource.getRepository(UserData);
    users.delete(id);
  }

  /*   @Patch('/user/:id')
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
    }*/

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
   async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: CarData,) {
    const carPicture = new CarPicture();
    carPicture.carPic = file.filename;
     const carId = req.carId;
    const carDataRepository = this.dataSource.getRepository(CarData);
    const car = await carDataRepository.findOne({
      where: { carId: carId },
    });
    carPicture.carsId = car;

    const carPictureRepository = this.dataSource.getRepository(CarPicture);
    await carPictureRepository.save(carPicture);
    return carPicture; 
  }

  @Get('uploadedfiles/cars/:carPic')
  async getCarPicture(@Param('carPic') carPic: string, @Res() res: Response) {
    const carPictureRepository = this.dataSource.getRepository(CarPicture);
    const carPicture = await carPictureRepository.findOne({ where: { carPic } });
    if (!carPicture || !carPicture.carPic) {
      res.status(404).send('Car picture not found');
      return;
    }
    return res.sendFile(carPicture.carPic, { root: './uploadedFiles/cars' });
  }
}
