import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { AppService } from './app.service';
import UserData from './entities/UserData.entity';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CarData from './entities/CarData.entity';
import { Response } from 'express';
import CarPicture from './entities/CarPicture.entity';
import CalendarData from './entities/CalendarData.entity';
import ChartData from './entities/ChartData.entity';
import DocumentData from './entities/DocumentData.entity';
import {
  BadRequestException,
} from '@nestjs/common';

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
    user.passwordAuth = userData.passwordAuth;
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

  //uj get cars
  @Get('usersCar/:id')
  async getUsersCars(@Param('id') userId: number) {
    const carRepo = this.dataSource.getRepository(CarData);
    const cars = await carRepo.find({
      where: { userId: { id: userId } },
      relations: ['pictures'],   // ← itt adjuk hozzá a relációt
    });
    return { cars };
  }

  @Get('car')
  async listCars() {
    const cars = this.dataSource.getRepository(CarData);
    return await cars.find();
  }

  @Get('carPic/:id')
  async getCarPic(@Param('id') userId: number) {
    const carPicRepo = this.dataSource.getRepository(CarPicture);
    const carRepo = this.dataSource.getRepository(CarData);
    const carId = await carRepo.find({ where: { userId: { id: userId } } });
    if (carId.length > 0) {
      const carID = carId[0].carId;
      const carPictures = await carPicRepo.find({
        where: {
          carsId: {
            carId: carID
          }
        }
      });
      return carPictures;
    }
    return [];
  }

  @Get('documents/:id')
  async getUsersDocuments(@Param('id') userId: number) {
    const documentRepo = this.dataSource.getRepository(DocumentData);
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    const doc = await documentRepo.find({ where: { carsData: car }, order: { date: 'ASC' } });
    return { docDatas: doc };
  }

  @Post('documents/:id')
  @HttpCode(200)
  async addDocument(@Body() documentData: DocumentData, @Param('id') usersId: number) {
    const documentRepo = this.dataSource.getRepository(DocumentData);
    documentData.docId = undefined;
    const doc = new DocumentData();
    doc.name = documentData.name;
    doc.date = documentData.date;
    const userId = usersId;
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    doc.carsData = car;
    documentData.carsData = car;
    doc.carsData = documentData.carsData;
    await documentRepo.save(doc);
    return doc;
  }

  @Get('calendarEvent/:carId')
  async getCalendarEvents(
    @Param('carId') carId: number,
    @Query('limit') limit: number,
    @Query('from') from?: string
  ) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({
      where: { carId: carId }
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const where = from
      ? { carData: car, start: MoreThanOrEqual(from) }
      : { carData: car };

    const events = await calendarRepo.find({
      where,
      take: limit,
      order: { start: 'ASC' }
    });

    return { calDatas: events };
  }
  /*@Get('calendarEvent/:id')
  async getCalendarEvents(@Param('id') userId: number, @Query('limit') limit: number, @Query('from') from?: string) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: { userId: user }
    })
    let where = { carData: car }
    let where2 = { carData: car, start: MoreThanOrEqual(from) }
    const event = await calendarRepo.find({ where: (from == undefined ? where : where2), take: limit, order: { start: 'ASC' } })
    return { calDatas: event };
  }*/

  @Post('calendarEvent/:carId')
  async addEvent(
    @Body() calendarData: CalendarData,
    @Param('carId') carId: number
  ) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({
      where: { carId: carId }
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const event = new CalendarData();
    event.title = calendarData.title;
    event.start = calendarData.start;
    event.comment = calendarData.comment;
    event.carData = car;

    await calendarRepo.save(event);
    return event;
  }

  @Delete('calendarEvent/:id')
  async deleteEvent(@Param('id') id: number) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    await calendarRepo.delete(id);
  }

  //uj car hozzáadása, userId alapján
  @Post('users/:userId/cars')
  @HttpCode(201)
  async addCar(
    @Param('userId') userId: number,
    @Body() carData: CarData
  ) {
    const carRepo = this.dataSource.getRepository(CarData);
    const userRepo = this.dataSource.getRepository(UserData);

    const user = await userRepo.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newCar = carRepo.create({
      brand: carData.brand,
      model: carData.model,
      modelYear: carData.modelYear,
      fuelType: carData.fuelType,
      carPower: carData.carPower,
      gearType: carData.gearType,
      color: carData.color,
      chassisType: carData.chassisType,
      doors: carData.doors,
      fuelEconomy: carData.fuelEconomy,
      license_plate: carData.license_plate,
      givenName: carData.givenName,
      userId: user
    });

    await carRepo.save(newCar);

    return newCar;
  }


  @Delete('user/:id')
  deleteUser(@Param('id') id: number) {
    const users = this.dataSource.getRepository(UserData);
    users.delete(id);
  }

  @Delete('documents/:id')
  deleteDocs(@Param('id') id: number) {
    const docs = this.dataSource.getRepository(DocumentData);
    docs.delete(id);
  }

  //uj chart
  @Get('chart/car/:carId')
  async getChartDataForCar(@Param('carId') carId: number) {
    const chartDataRepo = this.dataSource.getRepository(ChartData);

    const chartData = await chartDataRepo.find({
      where: {
        carData: {
          carId: carId,
        }
      }
    });

    const sortedChartData = chartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return { chart: sortedChartData };
  }

  @Post('chart/car/:carId')
  @HttpCode(200)
  async addChartDataForCar(
    @Body() chartData: ChartData,
    @Param('carId') carId: number
  ) {
    const chartDataRepo = this.dataSource.getRepository(ChartData);
    const carRepo = this.dataSource.getRepository(CarData);

    const car = await carRepo.findOne({
      where: { carId: carId }
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const chart = new ChartData();
    chart.speedometer = chartData.speedometer;
    chart.date = chartData.date;
    chart.carData = car;

    await chartDataRepo.save(chart);

    return chart;
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

  //uj upload carpic
  @Post('uploadfile/:carId')
  @UseInterceptors(FileInterceptor('carFile', {
    storage: diskStorage({
      destination: './uploadedFiles/cars',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');

        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },

    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        cb(new BadRequestException('Csak JPG, PNG vagy WEBP kép tölthető fel!'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('carId') carId: number
  ) {
    if (!file) {
      throw new BadRequestException('Nincs feltöltött fájl!');
    }

    const carRepo = this.dataSource.getRepository(CarData);
    const carPictureRepo = this.dataSource.getRepository(CarPicture);

    const car = await carRepo.findOne({
      where: { carId: carId }
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const carPicture = new CarPicture();
    carPicture.carPic = file.filename;
    carPicture.carsId = car;

    await carPictureRepo.save(carPicture);

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

  @Delete('deleteCarImage/:picId')
  async deleteCarImage(@Param('picId') picId: number) {

    const carPictureRepo = this.dataSource.getRepository(CarPicture);

    const picture = await carPictureRepo.findOne({
      where: { picId: picId }
    });

    if (!picture) {
      throw new NotFoundException('Picture not found');
    }

    const fs = require('fs');
    const path = `./uploadedFiles/cars/${picture.carPic}`;

    // fájl törlése disk-ről
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    // adatbázisból törlés
    await carPictureRepo.delete(picId);

    return { message: 'Picture deleted' };
  }
} 