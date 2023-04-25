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

  @Get('usersCar/:id')
  async getUsersCarById(@Param('id') userId: number) {
    const carRepo = this.dataSource.getRepository(CarData);
    const usersCar = await carRepo.find({ where: { userId: { id: userId } } });
    return { cars: usersCar };
  }

  @Get('car')
  async listCars() {
    const cars = this.dataSource.getRepository(CarData);
    return await cars.find();
  }

  @Get('calendarEvent/:id')
  async getCalendarEvents(@Param('id') userId: number, @Query('limit') limit: number, @Query('from') from?: string) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: {userId: user}
    })
    let where = {carData: car}
    let where2 = {carData: car, start: MoreThanOrEqual(from)}
    const event = await calendarRepo.find({where: (from == undefined? where : where2), take: limit, order: {start: 'ASC'}})
    return {calDatas: event};
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
      where: {userId: user}
    })
    const doc = await documentRepo.find({where: {carsData: car},order: {date: 'ASC'}});
    return {docDatas: doc};
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
      where: {userId: user}
    })
    doc.carsData = car;
    documentData.carsData = car;
    doc.carsData = documentData.carsData;
    await documentRepo.save(doc);
    return doc;
  }

  @Post('calendarEvent/:id')
  @HttpCode(200)
  async addEvent(@Body() calendarData: CalendarData, @Param('id') usersId: number) {
    const calendarRepo = this.dataSource.getRepository(CalendarData);
    calendarData.calId = undefined;
    const event = new CalendarData();
    event.title = calendarData.title;
    event.start = calendarData.start;
    event.comment = calendarData.comment;
    const userId = usersId;
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: {userId: user}
    })
    event.carData = car;
    calendarData.carData = car;
    event.carData = calendarData.carData;
    await calendarRepo.save(event);
    return event;
  }

  @Post('car/:id')
  @HttpCode(200)
  async addCar(@Body() carData: CarData, @Param('id') usersId: number) {
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
    const userId = usersId;
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

  @Delete('calendarEvent/:id')
  deleteEvent(@Param('id') id: number) {
    const event = this.dataSource.getRepository(CalendarData);
    event.delete(id);
  }

  @Delete('documents/:id')
  deleteDocs(@Param('id') id: number) {
    const docs = this.dataSource.getRepository(DocumentData);
    docs.delete(id);
  }

  @Get('chart/:id')
  async getChartData(@Param('id') userId: number){
    const chartDataRepo = this.dataSource.getRepository(ChartData);
    const carRepo = this.dataSource.getRepository(CarData);
    const carId = await carRepo.find({ where: { userId: { id: userId } } });
    if (carId.length > 0) {
      const carID = carId[0].carId;
      const chartData = await chartDataRepo.find({
        where: {
          carData: {
            carId: carID,
          }
        }
      });
      const sortedChartData = chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return { chart: sortedChartData };
    }
    return [];
  }

  @Post('chart/:id')
  @HttpCode(200)
  async addChartData(@Body()chartData: ChartData, @Param('id') usersId: number) {
    const chartDataRepo = this.dataSource.getRepository(ChartData);
    chartData.chartId = undefined;
    const chart = new ChartData();
    chart.speedometer = chartData.speedometer;
    chart.date = chartData.date;
    const userId = usersId;
    const carDataRepository = this.dataSource.getRepository(CarData);
    const userDataRepository = this.dataSource.getRepository(UserData);
    const user = await userDataRepository.findOne({
      where: { id: userId },
    });
    const car = await carDataRepository.findOne({
      where: {userId: user}
    })
    chart.carData = car;
    chartData.carData = car;
    chart.carData = chartData.carData;
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

  @Post('uploadfile/:id')
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: CarData, @Param('id') usersId: number) {
    const carPicture = new CarPicture();
    carPicture.carPic = file.filename;
    const carRepo = this.dataSource.getRepository(CarData);
    const carId = await carRepo.find({ where: { userId: { id: usersId } } }); // Assuming this is the car ID you want to find pictures for
    if (carId.length > 0) {
      const carID = carId[0].carId;
      //const carId = req.carId;
      const carDataRepository = this.dataSource.getRepository(CarData);
      const car = await carDataRepository.findOne({
        where: { carId: carID },
      });
      carPicture.carsId = car;

      const carPictureRepository = this.dataSource.getRepository(CarPicture);
      await carPictureRepository.save(carPicture);
      return carPicture;
    }
    return [];
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
